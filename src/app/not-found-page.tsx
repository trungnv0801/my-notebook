import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <div className='grid min-h-svh place-items-center p-6 text-center'>
      <div className='flex flex-col items-center space-y-4'>
        <p
          aria-hidden='true'
          className='bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text font-heading text-7xl font-extrabold tracking-tight text-transparent'
        >
          404
        </p>
        <h1 className='font-heading text-xl font-semibold text-heading'>{t('notFound.title')}</h1>
        <Link
          className='inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-accent-strong active:scale-[0.98]'
          to='/'
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  )
}
