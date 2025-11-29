import { format } from 'date-fns';

export function exportToWhatsApp(messages, characterName) {
  let whatsappText = `WhatsApp Chat Export - ${characterName}\n`;
  whatsappText += `Generated on ${format(new Date(), 'dd/MM/yyyy, HH:mm')}\n\n`;

  messages.forEach((msg) => {
    const timestamp = format(new Date(msg.created_at), 'dd/MM/yyyy, HH:mm');
    const sender = msg.role === 'user' ? 'You' : characterName;
    whatsappText += `[${timestamp}] ${sender}: ${msg.content}\n`;
  });

  return whatsappText;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

export function shareViaWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}
