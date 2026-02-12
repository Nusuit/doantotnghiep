
import { FieldType } from '../types';

// Rule-based Auto Tagger
export const autoClassifyPost = (content: string): FieldType => {
  const lower = content.toLowerCase();
  
  if (/(code|solana|web3|crypto|blockchain|rust|app|tech|ai|gpt)/.test(lower)) return 'Technology';
  if (/(physics|quantum|biology|chem|space|nasa|research|study)/.test(lower)) return 'Science';
  if (/(design|color|art|draw|paint|music|creative|ui|ux|nft)/.test(lower)) return 'Art';
  if (/(money|stock|market|trade|economy|invest|dollar|bitcoin|usdc)/.test(lower)) return 'Finance';
  if (/(health|gym|food|diet|workout|medicine|doctor|hospital)/.test(lower)) return 'Health';
  
  return 'General';
};
