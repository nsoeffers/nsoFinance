define('translations', [], function() {
    var translations = {};
    
    translations['en-us'] = {
        "accounts_title" : "Account overview",
        "account"        : "Account",
        "account_detail" : "Account info",
        "account_name"   : "Name",
        "bankaccount_nr" : "Bank Account Number", 
        "assets"         : "Assets",
        "liabilities"    : "Liabilities",
        "incomes"        : "Incomes",
        "expenses"       : "Expenses",
        "no_accounts"    : "No accounts found",
        "choose_account_or_create_new"  : "Choose an account or create a new one",
        "account_saved"                 : "Account is saved",
        "invalidBankAccountNumber"      : "Invalid bank account number",
        "requiredAccountName"           : "Account name is required",
        "duplicateAccountName"          : "An account with this name already exists, to avoid confusion it is not allowed to give different accounts the same name",
        
        "description"    : "Description",
        "save"           : "Save",
        "cancel"         : "Cancel",
        "loading"        : "Loading...",
        "success"        : "Well done!",
        "error"          : "Error!"
    };
    
    translations['en'] = translations['en-us'];

    translations['nl-be'] = {
        "accounts_title" : "Overzicht Rekeningen",
        "account"        : "Rekening",
        "account_detail" : "Gegevens van de rekening",
        "account_name"   : "Naam",
        "bankaccount_nr" : "Bankrekening nummer",
        "assets"         : "Activa",
        "liabilities"    : "Passiva",
        "incomes"        : "Inkomsten",
        "expenses"       : "Uitgaven",
        "no_accounts"    : "Geen rekeningen gevonden",
        "choose_account_or_create_new"  : "Selecteer een rekening of maak een nieuwe rekening aan via het plus symbool aan de linkerkant",
        "account_saved"                 : "Rekening is bewaard",
        "invalidBankAccountNumber"      : "Geen geldige bankrekeningnummer",
        "requiredAccountName"           : "De naam van een rekening is verplicht",
        "duplicateAccountName"          : "Een rekening met deze naam bestaat reeds, om verwarring te vermijden is het niet toegelaten verschillende rekeningen dezelfde naam te geven",
        
        "description"    : "Omschrijving",
        "save"           : "Opslaan",
        "cancel"         : "Annuleer",
        "loading"        : "Laden...",
        "success"        : "Gelukt!",
        "error"          : "Foutmelding!"
    };
    
    translations['nl-nl'] = translations['nl-be'];
    translations['nl'] = translations['nl-be'];

    return translations;
});