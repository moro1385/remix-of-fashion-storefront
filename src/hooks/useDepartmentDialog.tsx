import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function useDepartmentDialog() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState({ handle: "", name: "" });
  const navigate = useNavigate();

  const openDialogFor = (handle: string, name: string) => {
    setModalCategory({ handle, name });
    setModalOpen(true);
  };

  const navigateToCategory = (department: string) => {
    setModalOpen(false);
    navigate(`/shop?department=${department}&category=${modalCategory.handle}`);
  };

  const showKids = ["socks", "underwear", "undershirts"].includes(modalCategory.handle);

  const departmentDialog = (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light">برای چه کسی خرید می‌کنید؟</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <button
            onClick={() => navigateToCategory('men')}
            className="w-full py-4 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-sm"
          >
            {modalCategory.name} مردانه
          </button>
          <button
            onClick={() => navigateToCategory('women')}
            className="w-full py-4 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-sm"
          >
            {modalCategory.name} زنانه
          </button>
          {showKids && (
            <button
              onClick={() => navigateToCategory('kids')}
              className="w-full py-4 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-sm"
            >
              {modalCategory.name} بچگانه
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return { openDialogFor, departmentDialog };
}
