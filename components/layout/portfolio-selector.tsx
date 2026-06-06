"use client";

import { Check, ChevronsUpDown, Plus, Briefcase } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolioStore } from "@/stores/portfolio-store";

/** Switch between portfolios and create new ones from the navbar. */
export function PortfolioSelector() {
  const { portfolios, activeId, setActive, addPortfolio } = usePortfolioStore();
  const active = portfolios.find((p) => p.id === activeId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{active?.name ?? "Select"}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Portfolios</DropdownMenuLabel>
          {portfolios.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => setActive(p.id)}>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{p.name}</span>
              {p.id === activeId && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New portfolio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pf-name">Name</Label>
            <Input
              id="pf-name"
              value={name}
              autoFocus
              placeholder="e.g. Retirement"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  function create() {
    if (!name.trim()) return;
    addPortfolio(name.trim());
    setName("");
    setOpen(false);
  }
}
