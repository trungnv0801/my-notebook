import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, CircleCheck, NotebookPen } from 'lucide-react'
import { z } from 'zod'

import { useAuth } from '@/core/auth/use-auth'
import { authErrorMessage, firebaseErrorCode } from '@/core/lib/error-messages'
import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'

const schema = z.object({
  email: z.string().email()
})

const COOLDOWN_MS = 60_000
const COOLDOWN_STORAGE_KEY = 'notebook:password-reset-cooldown-until'

type FormValues = z.infer<typeof schema>

function storedCooldownUntil(): number {
  try {
    const value = Number(localStorage.getItem(COOLDOWN_STORAGE_KEY))
    if (Number.isFinite(value) && value > Date.now()) return value
    localStorage.removeItem(COOLDOWN_STORAGE_KEY)
  } catch {
    // The in-memory cooldown below still works when storage is unavailable.
  }

  return 0
}

function createCooldownWindow(): { now: number; until: number } {
  const now = Date.now()
  return { now, until: now + COOLDOWN_MS }
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { t } = useTranslation('common')
  const [formError, setFormError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(storedCooldownUntil)
  const [currentTime, setCurrentTime] = useState(Date.now)

  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - currentTime) / 1000))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  })

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return

    const intervalId = window.setInterval(() => {
      const now = Date.now()
      setCurrentTime(now)

      if (now >= cooldownUntil) {
        window.clearInterval(intervalId)
        try {
          localStorage.removeItem(COOLDOWN_STORAGE_KEY)
        } catch {
          // Storage may be unavailable in privacy-restricted browsers.
        }
      }
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [cooldownUntil])

  function startCooldown() {
    const { now, until } = createCooldownWindow()

    setCurrentTime(now)
    setCooldownUntil(until)
    try {
      localStorage.setItem(COOLDOWN_STORAGE_KEY, String(until))
    } catch {
      // The component state still enforces the cooldown for this page load.
    }
  }

  async function onSubmit(values: FormValues) {
    if (cooldownSeconds > 0) return

    setFormError(null)
    setEmailSent(false)

    try {
      await resetPassword(values.email)
      setEmailSent(true)
      startCooldown()
    } catch (error) {
      const errorCode = firebaseErrorCode(error)
      if (errorCode === 'auth/user-not-found') {
        setEmailSent(true)
        startCooldown()
        return
      }

      if (errorCode === 'auth/too-many-requests') startCooldown()

      const messageKey = authErrorMessage(errorCode)
      setFormError(t(`auth.errors.${messageKey}`))
    }
  }

  return (
    <div className='grid min-h-svh place-items-center p-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <span
            aria-hidden='true'
            className='grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md'
          >
            <NotebookPen className='size-6' />
          </span>
          <h1 className='font-heading text-xl font-bold tracking-tight text-heading'>
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className='text-sm text-text'>{t('auth.forgotPasswordDescription')}</p>
        </div>

        <Card className='space-y-4 rounded-2xl p-6 shadow-md'>
          <form className='space-y-3' onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='space-y-1'>
              <Label htmlFor='email'>{t('auth.email')}</Label>
              <Input id='email' type='email' autoComplete='email' {...register('email')} />
              {errors.email ? <p className='text-xs text-danger'>{t('form.required')}</p> : null}
            </div>

            {formError ? (
              <p
                role='alert'
                className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
              >
                <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
                {formError}
              </p>
            ) : null}

            {emailSent ? (
              <p
                role='status'
                className='flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              >
                <CircleCheck aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
                {t('auth.resetPasswordSent')}
              </p>
            ) : null}

            <Button type='submit' className='w-full' disabled={isSubmitting || cooldownSeconds > 0}>
              {isSubmitting
                ? t('states.loading')
                : cooldownSeconds > 0
                  ? t('auth.resendResetLinkIn', { seconds: cooldownSeconds })
                  : t('auth.sendResetLink')}
            </Button>
          </form>

          <p className='text-center text-sm'>
            <Link className='font-semibold text-accent underline-offset-4 hover:underline' to='/login'>
              {t('auth.backToSignIn')}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
