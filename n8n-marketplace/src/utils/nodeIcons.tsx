import React from 'react';
import {
  MessageSquare,
  Mail,
  Clock,
  FileText,
  Globe,
  Zap,
  Database,
  Webhook,
  Code,
  Cpu,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  Share2,
  Terminal,
  Box,
} from 'lucide-react';
import manifest from './nodeIconManifest.json';

// key -> "/icons/nodes/<key>.svg", downloaded from n8n.io by
// scripts/fetch-node-icons.mjs. Lower-cased keys for case-insensitive lookup.
const ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(manifest as Record<string, string>).map(([k, v]) => [
    k.toLowerCase(),
    v,
  ]),
);
const ICON_KEYS = Object.keys(ICONS).sort((a, b) => b.length - a.length);

const STRIP_SUFFIXES = ['trigger', 'tool'];

/** Resolve a stored node key (e.g. "googleSheetsTrigger") to a bundled icon path. */
function resolveIconPath(nodeType: string): string | null {
  let key = nodeType.toLowerCase();
  if (ICONS[key]) return ICONS[key];

  for (const suffix of STRIP_SUFFIXES) {
    if (key.endsWith(suffix) && ICONS[key.slice(0, -suffix.length)]) {
      return ICONS[key.slice(0, -suffix.length)];
    }
  }

  // Longest manifest key that the node key starts with (googleSheetsV2 -> googleSheets).
  const prefixMatch = ICON_KEYS.find((k) => key.startsWith(k) && k.length >= 4);
  if (prefixMatch) return ICONS[prefixMatch];

  return null;
}

function getLucideIcon(nodeType: string) {
  const t = nodeType.toLowerCase();
  if (t.includes('slack')) return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
  if (t.includes('gmail') || t.includes('email') || t.includes('mail'))
    return <Mail className="w-5 h-5 text-[#EA4335]" />;
  if (t.includes('cron') || t.includes('schedule') || t.includes('wait') || t.includes('interval'))
    return <Clock className="w-5 h-5 text-fg-subtle" />;
  if (t.includes('sheet') || t.includes('table') || t.includes('csv') || t.includes('spreadsheet'))
    return <FileText className="w-5 h-5 text-[#34A853]" />;
  if (t.includes('http') || t.includes('fetch') || t.includes('graphql'))
    return <Globe className="w-5 h-5 text-blue-500" />;
  if (t.includes('webhook') || t.includes('respondto'))
    return <Webhook className="w-5 h-5 text-orange-500" />;
  if (t.includes('trigger') || t.includes('start') || t.includes('manual'))
    return <Zap className="w-5 h-5 text-amber-500" />;
  if (t.includes('postgres') || t.includes('sql') || t.includes('mongo') || t.includes('redis') || t.includes('database'))
    return <Database className="w-5 h-5 text-[#336791]" />;
  if (t.includes('code') || t.includes('function') || t.includes('set') || t.includes('json'))
    return <Code className="w-5 h-5 text-fg-muted" />;
  if (t.includes('ai') || t.includes('gpt') || t.includes('llm') || t.includes('openai') || t.includes('agent') || t.includes('embed'))
    return <Cpu className="w-5 h-5 text-purple-500" />;
  if (t.includes('calendar')) return <Calendar className="w-5 h-5 text-blue-600" />;
  if (t.includes('stripe') || t.includes('payment') || t.includes('paypal'))
    return <CreditCard className="w-5 h-5 text-[#635BFF]" />;
  if (t.includes('image') || t.includes('media') || t.includes('cloudinary'))
    return <ImageIcon className="w-5 h-5 text-pink-500" />;
  if (t.includes('social') || t.includes('twitter') || t.includes('discord') || t.includes('telegram'))
    return <Share2 className="w-5 h-5 text-blue-400" />;
  if (t.includes('exec') || t.includes('ssh') || t.includes('command'))
    return <Terminal className="w-5 h-5 text-fg" />;
  return <Box className="w-5 h-5 text-fg-subtle" />;
}

/**
 * Returns the real n8n integration logo when one is bundled for this node type,
 * otherwise a generic lucide glyph.
 */
export const getNodeIcon = (nodeType: string, size = 20) => {
  const path = resolveIconPath(nodeType);
  if (path) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={path}
        alt={nodeType}
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  return getLucideIcon(nodeType);
};
