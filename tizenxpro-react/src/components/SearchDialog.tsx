import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  // AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSearch = () => {
    if (query.trim()) {
      onClose();
      setTimeout(() => {
        // Remove focus from active element
        (document.activeElement as HTMLElement)?.blur();
      }, 0);
      navigate(`/?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        {/* <AlertDialogTitle>Search</AlertDialogTitle> */}
        <Input
          ref={inputRef}
          autoFocus
          placeholder="Enter search term…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSearch();
          }}
          className="mt-4"
          data-focusable-popup
          tabIndex={0}
          enterKeyHint="search"
        />
        <br />
        <AlertDialogFooter>
          <AlertDialogCancel
            autoFocus={false}
            onClick={onClose}
            data-focusable-popup
            tabIndex={0}
            className="btn"
          >
            Back
          </AlertDialogCancel>
          <Button
            onClick={handleSearch}
            data-focusable-popup
            tabIndex={0}
            className="btn"
            style={
              { backgroundColor: "#ffa500", color: "white" }
            }
          >
            Search
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}