import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('🔍 Email confirmation attempt:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error) {
        console.log('✅ Email confirmation successful')
        // Redirect to a success page with welcome message
        const successUrl = new URL('/auth/confirmation-success', request.url)
        successUrl.searchParams.set('message', 'Email confirmed successfully!')
        return NextResponse.redirect(successUrl)
      } else {
        console.log('❌ Email confirmation error:', error.message)
        // Redirect to error page with specific error message
        const errorUrl = new URL('/auth/auth-code-error', request.url)
        errorUrl.searchParams.set('error', error.message)
        return NextResponse.redirect(errorUrl)
      }
    } catch (error) {
      console.log('❌ Email confirmation exception:', error)
      const errorUrl = new URL('/auth/auth-code-error', request.url)
      errorUrl.searchParams.set('error', 'Confirmation failed')
      return NextResponse.redirect(errorUrl)
    }
  }

  console.log('❌ Missing token_hash or type parameters')
  // redirect the user to an error page with instructions
  const errorUrl = new URL('/auth/auth-code-error', request.url)
  errorUrl.searchParams.set('error', 'Invalid confirmation link')
  return NextResponse.redirect(errorUrl)
}