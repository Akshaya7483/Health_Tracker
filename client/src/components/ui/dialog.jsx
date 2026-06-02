import { Dialog as ChakraDialog, Portal } from "@chakra-ui/react"
import * as React from "react"
import { CloseButton } from "./close-button"

export const DialogRoot = ChakraDialog.Root
export const DialogFooter = ChakraDialog.Footer
export const DialogHeader = ChakraDialog.Header
export const DialogBody = ChakraDialog.Body
export const DialogBackdrop = ChakraDialog.Backdrop
export const DialogTitle = ChakraDialog.Title
export const DialogDescription = ChakraDialog.Description
export const DialogTrigger = ChakraDialog.Trigger
export const DialogActionTrigger = ChakraDialog.ActionTrigger

export const DialogContent = React.forwardRef(function DialogContent(
  props,
  ref,
) {
  const { children, ...rest } = props
  return (
    <Portal>
      <DialogBackdrop />
      <ChakraDialog.Positioner>
        <ChakraDialog.Content ref={ref} {...rest}>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  )
})

export const DialogCloseTrigger = React.forwardRef(
  function DialogCloseTrigger(props, ref) {
    return (
      <ChakraDialog.CloseTrigger
        position="absolute"
        top="2"
        right="2"
        asChild
        {...props}
      >
        <CloseButton ref={ref} />
      </ChakraDialog.CloseTrigger>
    )
  },
)
