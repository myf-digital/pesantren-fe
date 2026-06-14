import OneSignal from 'react-onesignal'

let initialized = false

export async function initOneSignal(): Promise<void> {
  if (typeof window === 'undefined' || initialized) return

  try {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development'
    })

    initialized = true

    // Notification click
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('🔔 Notification clicked:', event)

      const targetUrl = (event.notification?.additionalData as Record<string, any>)?.target_url

      if (targetUrl) {
        window.location.href = targetUrl
      }
    })

    // Subscription changes
    OneSignal.User.PushSubscription.addEventListener('change', event => {
      console.log('🔄 Push subscription changed:', event)

      console.log('Subscription ID:', OneSignal.User.PushSubscription.id)

      console.log('Push Token:', OneSignal.User.PushSubscription.token)
    })

    console.log('✅ OneSignal initialized')
  } catch (error) {
    console.error('❌ OneSignal init failed:', error)
  }
}

export async function loginOneSignal(externalId: string, retryCount = 0): Promise<void> {
  if (typeof window === 'undefined' || !externalId) return

  if (!initialized) {
    console.warn('⚠️ OneSignal is not initialized yet. Retrying login in 500ms...')
    setTimeout(() => loginOneSignal(externalId, retryCount), 500)
    return
  }

  try {
    // Berikan jeda waktu singkat jika ini percobaan pertama agar internal module SDK siap
    if (retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    await OneSignal.login(externalId)

    console.log(`✅ OneSignal login success (${externalId})`)

    console.log('OneSignal ID:', OneSignal.User.onesignalId)

    console.log('External ID:', OneSignal.User.externalId)
  } catch (error: any) {
    console.error('❌ OneSignal login failed:', error)

    // Jika error adalah TypeError (biasanya karena internal module belum fully loaded), coba lagi
    if (error instanceof TypeError && retryCount < 5) {
      console.warn(`⚠️ OneSignal login failed due to TypeError. Retrying (${retryCount + 1}/5) in 1000ms...`)
      setTimeout(() => loginOneSignal(externalId, retryCount + 1), 1000)
    }
  }
}

export async function requestNotificationPermission(): Promise<void> {
  try {
    const permission = OneSignal.Notifications.permission

    if (!permission) {
      await OneSignal.Notifications.requestPermission()
    }
  } catch (error) {
    console.error('❌ Request permission failed:', error)
  }
}

export async function logoutOneSignal(): Promise<void> {
  try {
    await OneSignal.logout()

    console.log('✅ OneSignal logout success')
  } catch (error) {
    console.error('❌ OneSignal logout failed:', error)
  }
}

export function getSubscriptionInfo() {
  return {
    oneSignalId: OneSignal.User.onesignalId,
    externalId: OneSignal.User.externalId,
    subscriptionId: OneSignal.User.PushSubscription.id,
    token: OneSignal.User.PushSubscription.token,
    permission: OneSignal.Notifications.permission
  }
}
