import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContributeDialog = ({ open, onOpenChange }: ContributeDialogProps) => {
  const navigate = useNavigate();

  const handleContribute = () => {
    onOpenChange(false);
    navigate("/contribute");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-sacred flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Hey! You Can Contribute Now
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Tell us about the temple you know which is not listed but it is a special temple
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleContribute}
            className="w-full bg-gradient-sacred hover:opacity-90"
            size="lg"
          >
            Contribute Now
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeDialog;
