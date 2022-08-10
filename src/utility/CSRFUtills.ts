export default class CSRFUtils{
    static genCSRF(seed: string): string{
        return 'csrf' + seed; //TODO replace later
    }
}