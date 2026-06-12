export interface CensusAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface CensusRecord {
  _id?: string;
  numberOfPeople: number;
  address: CensusAddress;
  year: number;
  censusTaker: string;
}