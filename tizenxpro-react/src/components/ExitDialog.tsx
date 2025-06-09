import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  // AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export function ExitDialog({ open, onCancel, onExit }: { open: boolean; onCancel: () => void; onExit: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogTitle>Are you sure you want to exit xPro?</AlertDialogTitle>
        {/* <AlertDialogDescription>
          Möchtest du die App wirklich beenden?
        </AlertDialogDescription> */}
        <AlertDialogFooter>
          <AlertDialogCancel
            autoFocus
            data-focusable-popup
            tabIndex={0}
            className="btn"
            onClick={onCancel}
          >
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            data-focusable-popup
            tabIndex={0}
            className="btn"
            style={
              { backgroundColor: "#e73838", color: "white" }
            }
            onClick={onExit}
          >
            Beenden
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}