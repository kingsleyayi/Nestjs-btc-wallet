export interface Utxo {
  satoshis: number;
  script: string;
  address: string;
  txId: string;
  outputIndex: number;
}
