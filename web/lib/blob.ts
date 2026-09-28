// Strežniška stran samo preverja, ali je shramba nastavljena. Samo nalaganje gre
// prek app/api/najdba/zeton (client upload), mimo strežniške funkcije - glej opombo tam.
export const blobNaVoljo = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
