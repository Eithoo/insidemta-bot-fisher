# insidemta-bot-fisher
Bot do automatycznego łowienia ryb na serwerze Inside MTA, w grze Multi Theft Auto.

# Zabezpieczenia serwera
Niedawno serwer, na którym działał ten bot wprowadził zabezpieczenia, przez które ten bot **nie będzie już działać**. Aby nadal działał, należałoby go tak przerobić, aby korzystał z własnego sterownika klawiatury, imitował prawdziwy sprzęt. Ja już nie gram na tamtym serwerze, więc nie marnuję czasu na wprowadzenie owych zmian.

## Instalacja
- zainstaluj na komputerze Node.js, jeśli jeszcze nie masz
- pobierz kod i rozpakuj
- w folderze z botem, wpisz w konsoli: `npm install`

## Uruchomienie
- w folderze z botem, wpisz w konsoli: `node main.js`
- żeby włączyć lub wyłączyć bota *(będąc już w grze)* naciśnij **F7**

## Uprawnienia
Kod został napisany dla kilku znajomych, jest w nim proste zabezpieczenie na nazwę komputera. Jeśli chcesz się dodać, wpisz do `usersWithAccess` twoją nazwę użytkownika. (polecenie `hostname` w konsoli)\
Jeśli chcesz całkiem wyłączyć to zabezpieczenie, zmień zawartość funkcji `verifyAccess()` na `return true`.
