import { Injectable } from "@nestjs/common";

@Injectable()
export class MaskService {
  
  static applyMask(parentPath: string | null, nodeCode: number, levelWidths: number[], levelIndex: number): { ltree: string, formatted: string } {
    // 1. Pega a largura definida para este nível específico
    const width = levelWidths[levelIndex];
    
    // 2. Transforma o código em string com padding (Ex: 1 vira "01")
    const paddedCode = nodeCode.toString().padStart(width, '0');
    
    // 3. Monta o LTree (PostgreSQL usa ponto como separador)
    const ltree = parentPath 
      ? `${parentPath}.${paddedCode}` 
      : paddedCode;
      
    // 4. Monta o código formatado (Pode ser igual ao LTree ou ter separadores diferentes)
    const formatted = ltree.replace(/\./g, '.'); // Aqui você pode customizar o separador visual
    
    return { ltree, formatted };
  }
}