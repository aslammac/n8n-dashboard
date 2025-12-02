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
  Layers,
  Settings
} from 'lucide-react';

export const getNodeIcon = (nodeType: string) => {
  const lowerType = nodeType.toLowerCase();

  if (lowerType.includes('slack')) return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
  if (lowerType.includes('gmail') || lowerType.includes('email')) return <Mail className="w-5 h-5 text-[#EA4335]" />;
  if (lowerType.includes('cron') || lowerType.includes('schedule')) return <Clock className="w-5 h-5 text-gray-600" />;
  if (lowerType.includes('sheet') || lowerType.includes('table')) return <FileText className="w-5 h-5 text-[#34A853]" />;
  if (lowerType.includes('http') || lowerType.includes('fetch')) return <Globe className="w-5 h-5 text-blue-500" />;
  if (lowerType.includes('webhook')) return <Webhook className="w-5 h-5 text-orange-500" />;
  if (lowerType.includes('trigger')) return <Zap className="w-5 h-5 text-yellow-500" />;
  if (lowerType.includes('postgres') || lowerType.includes('sql') || lowerType.includes('mongo')) return <Database className="w-5 h-5 text-[#336791]" />;
  if (lowerType.includes('code') || lowerType.includes('function')) return <Code className="w-5 h-5 text-gray-700" />;
  if (lowerType.includes('ai') || lowerType.includes('gpt') || lowerType.includes('llm')) return <Cpu className="w-5 h-5 text-purple-600" />;
  if (lowerType.includes('calendar')) return <Calendar className="w-5 h-5 text-blue-600" />;
  if (lowerType.includes('stripe') || lowerType.includes('payment')) return <CreditCard className="w-5 h-5 text-[#635BFF]" />;
  if (lowerType.includes('image') || lowerType.includes('media')) return <ImageIcon className="w-5 h-5 text-pink-500" />;
  if (lowerType.includes('social') || lowerType.includes('twitter') || lowerType.includes('discord')) return <Share2 className="w-5 h-5 text-blue-400" />;
  if (lowerType.includes('exec')) return <Terminal className="w-5 h-5 text-gray-800" />;
  
  // Default
  return <Box className="w-5 h-5 text-gray-400" />;
};
