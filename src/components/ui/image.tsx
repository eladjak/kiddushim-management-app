
import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fallback = "/placeholder.svg", alt = "", ...props }, ref) => {
    const [src, setSrc] = React.useState(props.src)
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
      setSrc(props.src)
      setError(false)
    }, [props.src])

    const handleError = () => {
      if (!error) {
        setError(true)
        setSrc(fallback)
      }
    }

    return (
      <img 
        ref={ref}
        {...props}
        alt={alt}
        src={error ? fallback : src}
        onError={handleError}
        className={cn("max-w-full h-auto", className)}
      />
    )
  }
)

Image.displayName = "Image"

export { Image }
