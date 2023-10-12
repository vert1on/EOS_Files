export const PX = ''

export const IPFS_PREFIX = `${PX}https://${import.meta.env.VITE_THIRDWEB_SECRET_KEY}.ipfscdn.io/ipfs/` 

export const formatDate = (str: number): string => {
    const date = new Date(Number(str) * 1000)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export const downloadFile = async (url: string) => {
    try {
      const response = await fetch(`${PX}/${url}`, {
        method: "GET",
      });

      if (response.ok) {
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : "downloaded-file";
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Download request failed");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
export const formatShortEthAddress = (inputString: string, maxLength = 20) => {
  if (inputString.length <= maxLength) return inputString;
  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = maxLength - prefixLength - 3;
  const prefix = inputString.substring(0, prefixLength);
  const suffix = inputString.substring(inputString.length - suffixLength);
  return `${prefix}...${suffix}`;
};
