export const dashboardColors = {
  green: '#087443',
  green2: '#0b8a50',
  greenLight: '#eaf6ef',
  blue: '#246bc2',
  blueLight: '#edf4ff',
  purple: '#7041a5',
  purpleLight: '#f5effb',
  orange: '#f28c28',
  orangeLight: '#fff4e5',
  yellow: '#f5c542',
  red: '#dc3030',
  redLight: '#fff0f0',
  cyan: '#159ca6',
  text: '#172033',
  secondary: '#667085',
  border: '#e5e7eb',
  muted: '#f7f8fa'
}

export function scoreColor(score: number) {
  if (score >= 100) return dashboardColors.green
  if (score >= 90) return '#3aaa58'
  if (score >= 80) return dashboardColors.yellow
  if (score >= 70) return dashboardColors.orange

  return dashboardColors.red
}

export function scoreStatus(score: number) {
  if (score >= 100) return 'ISTIMEWA'
  if (score >= 90) return 'BAIK SEKALI'
  if (score >= 80) return 'BAIK'
  if (score >= 70) return 'CUKUP'

  return 'KURANG BAIK'
}
