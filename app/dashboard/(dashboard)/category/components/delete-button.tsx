"use client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/dashboard/category/category-actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function DeleteCategoryButton({id}: {id: string}) {
    const [isPending, startTransition] = useTransition();
    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteCategory(id);
            } catch (error) {
                toast.error("Category has posts, cannot delete");
            }
          
        });
    };
    return (
        <Button variant="destructive" size="sm" onClick={() => handleDelete(id)} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Delete</span>}
        </Button>
    );
}