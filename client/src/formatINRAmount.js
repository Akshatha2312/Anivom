const wholeAmountFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
  useGrouping: false,
})

const fractionalAmountFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

const formatINRAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '0'

  const roundedAmount = Math.round((amount + Number.EPSILON) * 100) / 100
  return Number.isInteger(roundedAmount)
    ? wholeAmountFormatter.format(roundedAmount)
    : fractionalAmountFormatter.format(roundedAmount)
}

export default formatINRAmount