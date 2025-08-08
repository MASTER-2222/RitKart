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
        // Use production domain for redirect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ritzone-frontend.onrender.com'
        const successUrl = `${baseUrl}/auth/confirmation-success?message=${encodeURIComponent('Email confirmed successfully!')}`
        return NextResponse.redirect(successUrl)
      } else {
        console.log('❌ Email confirmation error:', error.message)
        // Use production domain for error redirect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ritzone-frontend.onrender.com'
        const errorUrl = `${baseUrl}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
        return NextResponse.redirect(errorUrl)
      }
    } catch (error) {
      console.log('❌ Email confirmation exception:', error)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ritzone-frontend.onrender.com'
      const errorUrl = `${baseUrl}/auth/auth-code-error?error=${encodeURIComponent('Confirmation failed')}`
      return NextResponse.redirect(errorUrl)
    }
  }

  console.log('❌ Missing token_hash or type parameters')
  // Use production domain for invalid link redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ritzone-frontend.onrender.com'
  const errorUrl = `${baseUrl}/auth/auth-code-error?error=${encodeURIComponent('Invalid confirmation link')}`
  return NextResponse.redirect(errorUrl)
}