
const DromiLogo = ({
  size = 4
}: {
  size?: number
}) => {
  return (
    <img src="https://r2.dromi.app/logo.svg" alt="dromi" className={`h-${size} w-${size}`} />
  )
}

export default DromiLogo