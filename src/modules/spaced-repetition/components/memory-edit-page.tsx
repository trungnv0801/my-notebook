import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { EmptyState } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'
import type { Note } from '@/types/base-note'

import { useMemoies, useUpdateMemory } from '../hooks/use-memories'
import type { MemoryItem } from '../types'
import { MemoryForm, type MemoryFormValues } from './memory-form'

export default function MemoryEditPage() {
  const { memoryId } = useParams()
  const { t } = useTranslation('spaced-repetition')
  const memoriesQuery = useMemoies()
  const memory = memoriesQuery.data?.find((item) => item.id === memoryId)

  if (memoriesQuery.isPending) return <Spinner className='mx-auto my-24' />

  if (!memory) {
    return (
      <EmptyState
        title={t('edit.notFound')}
        action={
          <Link className='text-accent underline' to='..'>
            {t('actions.back', { ns: 'common' })}
          </Link>
        }
      />
    )
  }

  return <MemoryEditForm memory={memory} />
}

function MemoryEditForm({ memory }: { memory: Note<MemoryItem> }) {
  const navigate = useNavigate()
  const { t } = useTranslation('spaced-repetition')
  const updateMemory = useUpdateMemory()
  const currentPracticeUrls = memory.practiceUrls

  async function onSubmit(values: MemoryFormValues) {
    const practiceUrls = values.practiceLinks.map(({ url }) => url)
    const practiceListChanged = JSON.stringify(practiceUrls) !== JSON.stringify(currentPracticeUrls)

    await updateMemory.mutateAsync({
      memoryId: memory.id,
      patch: {
        title: values.title,
        practiceUrls,
        ...(practiceListChanged ? { practiceDone: false } : {})
      }
    })
    void navigate('..')
  }

  return (
    <MemoryForm
      title={t('edit.title')}
      submitLabel={t('edit.submit')}
      defaultValues={{ title: memory.title, practiceLinks: currentPracticeUrls.map((url) => ({ url })) }}
      onCancel={() => void navigate('..')}
      onSubmit={onSubmit}
    />
  )
}
