import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, NotebookPen } from 'lucide-react'
import { z } from 'zod'

import { useAuth } from '@/core/auth/use-auth'
import { authErrorMessage, firebaseErrorCode } from '@/core/lib/error-messages'
import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('common')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  function toMessage(error: unknown): string {
    return t(`auth.errors.${authErrorMessage(firebaseErrorCode(error))}`)
  }

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await signIn(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(toMessage(error))
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
          <h1 className='font-heading text-xl font-bold tracking-tight text-heading'>{t('auth.signInTitle')}</h1>
        </div>

        <Card className='space-y-4 rounded-2xl p-6 shadow-md'>
          <form className='space-y-3' onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='space-y-1'>
              <Label htmlFor='email'>{t('auth.email')}</Label>
              <Input id='email' type='email' autoComplete='email' {...register('email')} />
              {errors.email ? <p className='text-xs text-danger'>{t('form.required')}</p> : null}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='password'>{t('auth.password')}</Label>
              <Input id='password' type='password' autoComplete='current-password' {...register('password')} />
              {errors.password ? <p className='text-xs text-danger'>{t('auth.errors.weakPassword')}</p> : null}
              <div className='text-right'>
                <Link
                  className='text-xs font-semibold text-accent underline-offset-4 hover:underline'
                  to='/forgot-password'
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
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

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? t('states.loading') : t('auth.signInAction')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
