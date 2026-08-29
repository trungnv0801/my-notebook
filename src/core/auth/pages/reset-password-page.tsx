import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, CircleCheck, NotebookPen } from 'lucide-react'
import { z } from 'zod'

import { useAuth } from '@/core/auth/use-auth'
import { authErrorMessage, firebaseErrorCode } from '@/core/lib/error-messages'
import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'

const schema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { verifyResetCode, confirmResetPassword } = useAuth()
  const { t } = useTranslation('common')
  const [searchParams] = useSearchParams()
  const code = searchParams.get('oobCode')
  const [email, setEmail] = useState<string | null>(null)
  const [linkError, setLinkError] = useState(code === null)
  const [formError, setFormError] = useState<string | null>(null)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  useEffect(() => {
    let active = true

    if (!code) return

    void verifyResetCode(code)
      .then((resetEmail) => {
        if (active) setEmail(resetEmail)
      })
      .catch(() => {
        if (active) setLinkError(true)
      })

    return () => {
      active = false
    }
  }, [code, verifyResetCode])

  async function onSubmit(values: FormValues) {
    if (!code) return

    setFormError(null)
    try {
      await confirmResetPassword(code, values.password)
      setPasswordUpdated(true)
    } catch (error) {
      const messageKey = authErrorMessage(firebaseErrorCode(error))
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
          <h1 className='font-heading text-xl font-bold tracking-tight text-heading'>{t('auth.resetPasswordTitle')}</h1>
          {email ? <p className='text-sm text-text'>{t('auth.resetPasswordDescription', { email })}</p> : null}
        </div>

        <Card className='space-y-4 rounded-2xl p-6 shadow-md'>
          {!email && !linkError ? (
            <div className='grid place-items-center py-6' aria-label={t('states.loading')}>
              <Spinner />
            </div>
          ) : null}

          {linkError ? (
            <p
              role='alert'
              className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
            >
              <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
              {t('auth.errors.resetLinkInvalid')}
            </p>
          ) : null}

          {email && !passwordUpdated ? (
            <form className='space-y-3' onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className='space-y-1'>
                <Label htmlFor='password'>{t('auth.newPassword')}</Label>
                <Input id='password' type='password' autoComplete='new-password' {...register('password')} />
                {errors.password ? <p className='text-xs text-danger'>{t('auth.errors.weakPassword')}</p> : null}
              </div>

              <div className='space-y-1'>
                <Label htmlFor='confirmPassword'>{t('auth.confirmPassword')}</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  autoComplete='new-password'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                  <p className='text-xs text-danger'>{t('auth.errors.passwordMismatch')}</p>
                ) : null}
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
                {isSubmitting ? t('states.loading') : t('auth.updatePassword')}
              </Button>
            </form>
          ) : null}

          {passwordUpdated ? (
            <p
              role='status'
              className='flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
            >
              <CircleCheck aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
              {t('auth.resetPasswordSuccess')}
            </p>
          ) : null}

          {linkError || passwordUpdated ? (
            <p className='text-center text-sm'>
              <Link className='font-semibold text-accent underline-offset-4 hover:underline' to='/login'>
                {t('auth.backToSignIn')}
              </Link>
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
