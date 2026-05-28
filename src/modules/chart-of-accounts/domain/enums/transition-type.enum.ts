export enum TransitionType {
  CREATION = 'creation',        // 0:1 (Nova conta criada do nada)
  SPLIT = 'split',              // 1:N (Desmembramento - Ex: TI -> Hardware + Software)
  MERGE = 'merge',              // N:1 (Agrupamento - Ex: Fixo + Móvel -> Telefonia)
  DISCONTINUE = 'discontinue',  // 1:0 (Conta foi morta e não tem sucessora direta nem saldo para migrar)
  RECLASSIFY = 'reclassify',    // 1:1 (Mudou de grupo - Ex: Conta saiu do Ativo Circulante para o Não Circulante)
}

export const TransitionMetadata = {
  [TransitionType.CREATION]:    { src: 0, tgt: 1 },
  [TransitionType.RECLASSIFY]:  { src: 1, tgt: 1 },
  [TransitionType.SPLIT]:       { src: 1, tgt: 'n' },
  [TransitionType.MERGE]:       { src: 'n', tgt: 1 },
  [TransitionType.DISCONTINUE]: { src: 1, tgt: 0 },
};