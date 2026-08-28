// @vitest-environment node
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const emulatorReady = Boolean(process.env.FIRESTORE_EMULATOR_HOST)

describe.skipIf(!emulatorReady)('firestore.rules', () => {
  let testEnv: RulesTestEnvironment

  // A date-only recurring task (e.g. an annual health check-up).
  const validTask = {
    name: 'Khám sức khỏe tổng quát',
    emoji: '🩺',
    notes: null,
    intervalDays: null,
    intervalMonths: 12,
    trackReading: false,
    readingLabel: null,
    intervalReading: null,
    createdAt: serverTimestamp()
  }

  const validLog = {
    taskId: 'task-1',
    performedAt: Date.parse('2026-01-01'),
    readingValue: null,
    createdAt: serverTimestamp()
  }

  const validMemory = {
    title: '',
    content: 'Spacing effect: distributed practice beats cramming.',
    quizUrl: 'https://example.com/quiz',
    quizDone: false,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    createdAt: serverTimestamp()
  }

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-notebook',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: 'localhost',
        port: Number(process.env.FIRESTORE_EMULATOR_PORT ?? 8080)
      }
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  it('lets owners write and read their own data', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const taskReference = doc(alice.firestore(), 'users', 'alice', 'maintenanceTasks', 't1')
    const logReference = doc(alice.firestore(), 'users', 'alice', 'maintenanceLogs', 'l1')
    await assertSucceeds(setDoc(taskReference, validTask))
    await assertSucceeds(getDoc(taskReference))
    await assertSucceeds(setDoc(logReference, validLog))
    await assertSucceeds(getDoc(logReference))
    const memoryReference = doc(alice.firestore(), 'users', 'alice', 'memoryItems', 'm1')
    await assertSucceeds(setDoc(memoryReference, validMemory))
    await assertSucceeds(getDoc(memoryReference))
  })

  it('accepts metered tasks with custom units and day-based intervals', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const tasks = alice.firestore().collection('users/alice/maintenanceTasks')
    // A metered chore such as an oil change.
    await assertSucceeds(
      setDoc(doc(tasks, 'metered'), {
        ...validTask,
        name: 'Thay dầu xe máy',
        intervalMonths: null,
        trackReading: true,
        readingLabel: 'km',
        intervalReading: 2000
      })
    )
    // The unit label is free-form, so any metered resource works.
    await assertSucceeds(
      setDoc(doc(tasks, 'litres'), {
        ...validTask,
        name: 'Vệ bình nước',
        trackReading: true,
        readingLabel: 'lít',
        intervalReading: 50
      })
    )
    // Day-based chores such as watering plants.
    await assertSucceeds(setDoc(doc(tasks, 'daily'), { ...validTask, name: 'Tưới cây', intervalDays: 3 }))
  })

  it("user A cannot read user B's data", async () => {
    const bob = testEnv.authenticatedContext('bob')
    await assertFails(getDoc(doc(bob.firestore(), 'users', 'alice', 'maintenanceTasks', 't1')))
    await assertFails(getDoc(doc(bob.firestore(), 'users', 'alice', 'maintenanceLogs', 'l1')))
  })

  it('rejects invalid payloads (missing required fields / bad types)', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const taskReference = doc(alice.firestore(), 'users', 'alice', 'maintenanceTasks', 'bad')
    // A task without any interval must be rejected.
    await assertFails(
      setDoc(taskReference, { ...validTask, intervalDays: null, intervalMonths: null, intervalReading: null })
    )
    // trackReading must agree with the presence of the reading interval…
    await assertFails(setDoc(taskReference, { ...validTask, trackReading: true }))
    await assertFails(setDoc(taskReference, { ...validTask, trackReading: true, readingLabel: 'km' }))
    // …and a date-only task must not carry a unit label.
    await assertFails(setDoc(taskReference, { ...validTask, readingLabel: 'km' }))
    // A boolean field of the wrong type must be rejected.
    await assertFails(setDoc(taskReference, { ...validTask, trackReading: 'yes' }))
    const logReference = doc(alice.firestore(), 'users', 'alice', 'maintenanceLogs', 'bad')
    // A negative meter reading must be rejected.
    await assertFails(setDoc(logReference, { ...validLog, readingValue: -5 }))
    const memoryReference = doc(alice.firestore(), 'users', 'alice', 'memoryItems', 'bad')
    // A non-boolean quiz-done flag must be rejected…
    await assertFails(setDoc(memoryReference, { ...validMemory, quizDone: 'yes' }))
    // …as must a quiz link that is not an http(s) URL.
    await assertFails(setDoc(memoryReference, { ...validMemory, quizUrl: 'javascript:alert(1)' }))
  })

  it('rejects unauthenticated access', async () => {
    const anonymous = testEnv.unauthenticatedContext()
    await assertFails(getDoc(doc(anonymous.firestore(), 'users', 'alice', 'maintenanceTasks', 't1')))
  })

  it('requires server-set createdAt on create', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const reference = doc(alice.firestore(), 'users', 'alice', 'maintenanceTasks', 'no-created-at')
    await assertFails(setDoc(reference, { ...validTask, createdAt: Date.now() }))
  })

  it('stores the expected rules payload shape', () => {
    expect(Object.keys(validTask)).toContain('intervalMonths')
    expect(Object.keys(validTask)).toContain('trackReading')
    expect(Object.keys(validTask)).toContain('intervalReading')
    expect(Object.keys(validLog)).toContain('readingValue')
    expect(Object.keys(validMemory)).toContain('quizDone')
  })
})
