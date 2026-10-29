export function errorMessage(error: unknown) {
  return typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : 'Terjadi kesalahan saat memproses data'
}

export function downloadFinanceFile(result: { status: boolean; data?: string; message?: string }) {
  if (!result.status || !result.data) throw new Error(result.message || 'Gagal mengunduh file')
  const link = document.createElement('a')

  link.href = `${process.env.NEXT_PUBLIC_API_URL}${result.data}`
  link.download = ''
  document.body.appendChild(link)
  link.click()
  link.remove()
}
