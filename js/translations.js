define('translations', [], function() {
    var translations = {};
    
    translations['en-us'] = {        
        "unsupportedBrowser": "Unsupported Browser",
        "unsupportedExplanation" : "The browser you use is not supported because it does not support the IndexedDB technology. This is the local database we use to store your data for the moment.",
        
        "accounts_title"    : "Account overview",
        "account"           : "Account",
        "accounts"          : "Accounts",
        "account_detail"    : "Account info",
        "account_name"      : "Name",
        "bankaccount_nr"    : "Bank Account Number", 
        "assets"            : "Assets",
        "liabilities"       : "Liabilities",
        "incomes"           : "Incomes",
        "expenses"          : "Expenses",
        "no_accounts"       : "No accounts found",
        "choose_account_or_create_new"  : "Choose an account or create a new one",
        "account_saved"                 : "Account is saved",
        "invalidBankAccountNumber"      : "Invalid bank account number",
        "requiredAccountName"           : "Account name is required",
        "duplicateAccountName"          : "An account with this name already exists, to avoid confusion it is not allowed to give different accounts the same name",
        
        "transactions"              : "Transacties",
        "import"                    : "Import",
        "import_title"              : "Import transactions",
        "configureImportFile"       : "Choose the file containing the transactions you wish to import",
        "previewTable"              : "Preview of data in selected file",
        "mapConceptsOntoData"       : "Identify some columns by dragging the labels to the correct column",
        "transactionDateField"      : "Date",
        "transactionAmountField"    : "Amount",
        "transactionAddressField"   : "Address",
        "file"                      : "File",
        
        "product_name"              : "nsoFinance",
        "description"               : "Description",
        "save"                      : "Save",
        "cancel"                    : "Cancel",
        "select"                    : "Select",
        "loading"                   : "Loading...",
        "success"                   : "Well done!",
        "error"                     : "Error!"
    };
    
    translations.en = translations['en-us'];

    translations['nl-be'] = {
        "unsupportedBrowser": "Niet gesupporteerde browser",
        "unsupportedExplanation" : "De browser die u momenteel gebruikt wordt niet gesupporteerd omdat deze browser zelf geen support biedt voor de IndexedDB technology. Dit is een lokale database die we momenteel gebruiken om uw data in op te slaan.",
        
        "accounts_title"    : "Overzicht Rekeningen",
        "account"           : "Rekening",
        "accounts"          : "Rekeningen",
        "account_detail"    : "Gegevens van de rekening",
        "account_name"      : "Naam",
        "bankaccount_nr"    : "Bankrekening nummer",
        "assets"            : "Activa",
        "liabilities"       : "Passiva",
        "incomes"           : "Inkomsten",
        "expenses"          : "Uitgaven",
        "no_accounts"       : "Geen rekeningen gevonden",
        "choose_account_or_create_new"  : "Selecteer een rekening of maak een nieuwe rekening aan via het plus symbool aan de linkerkant",
        "account_saved"                 : "Rekening is bewaard",
        "invalidBankAccountNumber"      : "Geen geldige bankrekeningnummer",
        "requiredAccountName"           : "De naam van een rekening is verplicht",
        "duplicateAccountName"          : "Een rekening met deze naam bestaat reeds, om verwarring te vermijden is het niet toegelaten verschillende rekeningen dezelfde naam te geven",
        
        "transactions"              : "Transacties",
        "import"                    : "Importeren",
        "import_title"              : "Importeren van transacties",
        "configureImportFile"       : "Kies het bestand dat de transacties bevat die u wilt importeren",
        "previewTable"              : "Voorbeeld data uit het geselecteerde bestand",
        "mapConceptsOntoData"       : "Identificeer bepaalde kolommen door de labels naar de correct kolom te slepen",
        "transactionDateField"      : "Datum",
        "transactionAmountField"    : "Bedrag",
        "transactionAddressField"   : "Adres",        
        "file"                      : "Bestand",
        
        "product_name"              : "nsoFinance",
        "description"               : "Omschrijving",
        "save"                      : "Opslaan",
        "cancel"                    : "Annuleer",
        "select"                    : "Selecteer",
        "loading"                   : "Laden...",
        "success"                   : "Gelukt!",
        "error"                     : "Foutmelding!"
    };
    
    translations['nl-nl'] = translations['nl-be'];
    translations.nl = translations['nl-be'];

    return translations;
});