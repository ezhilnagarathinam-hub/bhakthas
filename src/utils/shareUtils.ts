import { toast } from "sonner";

export const shareItem = async (title: string, text: string, url?: string) => {
  const shareData = {
    title,
    text,
    url: url || window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        fallbackShare(shareData.url);
      }
    }
  } else {
    fallbackShare(shareData.url);
  }
};

const fallbackShare = (url: string) => {
  navigator.clipboard.writeText(url);
  toast.success("Link copied to clipboard!");
};
