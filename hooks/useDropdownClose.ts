import { useEffect } from "react"

const useDropdownClose = (
  refs: Array<React.RefObject<HTMLElement | null>>,
  onClose: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInside = refs.some((ref) => ref.current?.contains(target))

      if (!clickedInside) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClick)

    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [onClose, refs])
}

export default useDropdownClose