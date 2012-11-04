define('translations', [], function() {
    var translations = {};
    
    translations['en-us'] = {        
        "unsupportedBrowser": "Unsupported Browser",
        "unsupportedExplanation" : "The browser you use is not supported because it does not support the IndexedDB technology. This is the local database we use to store your data for the moment.",
        
        "accounts_title"    : "Category overview",
        "account"           : "Category",
        "accounts"          : "Categories",
        "account_detail"    : "Category info",
        "account_name"      : "Name",
        "bankaccount_nr"    : "Bank Account Number", 
        "assets"            : "Assets",
        "liabilities"       : "Liabilities",
        "incomes"           : "Incomes",
        "expenses"          : "Expenses",
        "no_accounts"       : "No categories found",
        "choose_account_or_create_new"  : "Choose a category or create a new one",
        "account_saved"                 : "Category is saved",
        "invalidBankAccountNumber"      : "Invalid bank account number",
        "requiredAccountName"           : "Category name is required",
        "duplicateAccountName"          : "A category with this name already exists, to avoid confusion it is not allowed to give different categories the same name",
        
        "transactions"                  : "Transactions",
        "import"                        : "Import",
        "import_title"                  : "Import transactions",
        "delimiter"                     : "Delimiter",
        "escaper"                       : "Escaper",
        "dateFormat"                    : "Date format",
        "firstRowIsHeader"              : "First row is header",
        "column"                        : "Column ",
        "configureImportFile"           : "Choose the file containing the transactions you wish to import",
        "previewTable"                  : "Preview of data in selected file",
        "mapConceptsOntoData"           : "Identify columns by dragging the fields to the correct column, some columns may already been mapped by the automap function but is always a good habit to verify them.",
        "processFile"                   : "Congratulations all required fields are mapped. Push the button below to start importing all the transactions in the file or continue to map the optional fields as well",
        "continueImport"                : "Import all transactions",
        "transactionDateField"          : "Date",
        "transactionAmountField"        : "Amount",
        "transactionDescriptionField"   : "Description",
        "transactionAddressField"       : "Address",
        "debetAccountField"             : "Debet",
        "creditAccountField"            : "Credit",
        "readingFile"                   : "Reading File",
        "savingTransactions"            : "Saving Transactions",
        "file"                          : "File",
        "advancedSettings"              : "Advanced Settings",
        "successImport"                 : "Successfully imported transactions",
        
        "assign_title"                  : "Assign categories to the transactions",
        "assign"                        : "Assign",
        
        "rules"                         : "Rules",
        "rules_title"                   : "Rules for automatic labelling",
        "ruleWhen"                      : "When transaction field: ",
        "ruleThen"                      : "then categorize transaction into category:",
        "operatorEquals"                : "is equal to",
        "operatorLike"                  : "contains the text",

        
        "settings"                      : "Settings",
        "removeAllTransactionsDescription" : "Select this button if you want to delete all transactions. Other data like categories and rules will not be touched.",
        "removeAllTransactions"         : "Remove all transactions",

        
        "product_name"                  : "nsoFinance",
        "description"                   : "Description",
        "save"                          : "Save",
        "cancel"                        : "Cancel",
        "select"                        : "Select",
        "loading"                       : "Loading...",
        "success"                       : "Well done!",
        "error"                         : "Error!"
    };
    
    translations.en = translations['en-us'];

    translations['nl-be'] = {
        "unsupportedBrowser": "Niet gesupporteerde browser",
        "unsupportedExplanation" : "De browser die u momenteel gebruikt wordt niet gesupporteerd omdat deze browser zelf geen support biedt voor de IndexedDB technology. Dit is een lokale database die we momenteel gebruiken om uw data in op te slaan.",
        
        "accounts_title"    : "Overzicht categorieën",
        "account"           : "Categorie",
        "accounts"          : "Categorieën",
        "account_detail"    : "Gegevens van de categorie",
        "account_name"      : "Naam",
        "bankaccount_nr"    : "Bankrekening nummer",
        "assets"            : "Activa",
        "liabilities"       : "Passiva",
        "incomes"           : "Inkomsten",
        "expenses"          : "Uitgaven",
        "no_accounts"       : "Geen categorieën gevonden",
        "choose_account_or_create_new"  : "Selecteer een categorie of maak een nieuwe categorie aan via het plus symbool aan de linkerkant",
        "account_saved"                 : "Categorie is bewaard",
        "invalidBankAccountNumber"      : "Geen geldige bankrekeningnummer",
        "requiredAccountName"           : "De naam van een categorie is verplicht",
        "duplicateAccountName"          : "Een categorie met deze naam bestaat reeds, om verwarring te vermijden is het niet toegelaten verschillende categorieën dezelfde naam te geven",
        
        "transactions"                  : "Verrichtingen",
        "import"                        : "Importeren",
        "import_title"                  : "Importeren van verrichtingen",
        "delimiter"                     : "Scheidingsteken",
        "escaper"                       : "Escaper",
        "dateFormat"                    : "Datum formaat",
        "firstRowIsHeader"              : "Eerste rij is hoofding",
        "column"                        : "Kolom ",
        "configureImportFile"           : "Kies het bestand dat de verrichtingen bevat die u wilt importeren",
        "previewTable"                  : "Voorbeeld data uit het geselecteerde bestand",
        "mapConceptsOntoData"           : "Identificeer de kolommen door de velden naar de correcte kolom te slepen, sommige kolommen kunnen al gelinkt zijn door onze automap functionaliteit maar het is een goede gewoonte om deze nog even na te kijken",
        "processFile"                   : "Proficiat, alle verplichte velden zijn gelinkt. Druk op de knop om alle verrichtingen te importeren of ga nog even verder om ook de optionele velden te linken",
        "continueImport"                : "Importeer alle verrichtingen",
        "transactionDateField"          : "Datum",
        "transactionAmountField"        : "Bedrag",
        "transactionDescriptionField"   : "Omschrijving",
        "transactionAddressField"       : "Adres",  
        "debetAccountField"             : "Debet",
        "creditAccountField"            : "Credit",
        "readingFile"                   : "Bestand lezen",
        "savingTransactions"            : "Transacties opslaan",
        "file"                          : "Bestand",
        "advancedSettings"              : "Geavanceerde Instellingen",
        "successImport"                 : "De verrichtingen zijn succesvol geimporteerd",
        
        "assign_title"                  : "Toewijzen van categorieën aan verrichtingen",
        "assign"                        : "Toewijzen",
        
        "rules"                         : "Regels",
        "rules_title"                   : "Regels voor het automatisch categoriseren",
        "ruleWhen"                      : "ALS het veld ",
        "ruleThen"                      : "wijs dan de verrichting toe aan categorie",
        "operatorEquals"                : "gelijk is aan",
        "operatorLike"                  : "de volgende tekst bevat",
        
        "settings"                      : "Instellingen",
        "removeAllTransactionsDescription" : "Selecteer onderstaande knop indien u alle verrichtingen wilt verwijderen. Andere data zoals labels en regels zullen blijven bestaan.",
        "removeAllTransactions"         : "Verwijder alle verrichtingen",
        
        "product_name"                  : "nsofinance",
        "description"                   : "Omschrijving",
        "save"                          : "Opslaan",
        "cancel"                        : "Annuleer",
        "select"                        : "Selecteer",
        "loading"                       : "Laden...",
        "success"                       : "Gelukt!",
        "error"                         : "Foutmelding!"
    };
    
    translations['nl-nl'] = translations['nl-be'];
    translations.nl = translations['nl-be'];

    return translations;
});