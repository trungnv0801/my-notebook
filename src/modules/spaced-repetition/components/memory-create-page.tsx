import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useCreateMemory } from '../hooks/use-memories'
import { MemoryForm, type MemoryFormValues } from './memory-form'

export default function MemoryCreatePage() {
  const createMemory = useCreateMemory()
  const navigate = useNavigate()
  const { t } = useTranslation('spaced-repetition')

  async function onSubmit(values: MemoryFormValues) {
    await createMemory.mutateAsync({
      title: values.title,
      practiceUrls: values.practiceLinks.map(({ url }) => url)
    })
    void navigate('..')
  }

  return (
    <MemoryForm
      title={t('create.title')}
      submitLabel={t('create.submit')}
      defaultValues={{ title: '', practiceLinks: [{ url: '' }] }}
      onCancel={() => void navigate('..')}
      onSubmit={onSubmit}
    />
  )
}
