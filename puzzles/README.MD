Contenu du répertoire TP2 - IFT3225 (H16)

*.json : fichiers de grilles de mots croisés en format JSON
IFT3225.json : petite grille pour faciliter la mise au point
Puz2json.java: programme Java de conversion d'un fichier en format PUZ vers le format JSON
Puz2json.class: classe Java compilée de Puz2json.java

Description du format JSON 
Les champs correspondent à ceux du format PUZ décrit de façon assez cryptique à
    https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
- nCols: nombre de colonnes
- nRows: nombre de rangées
- author: auteur de la grille (optionnel)
- puzzle: titre de la grille (optionnel)
- copyright: copyright (optionnel)
- solution: lettres à placer dans la grilles, les carreaux noirs sont indiqués par des points
- numbers: listes de lignes, chacune étant une liste de numéros des définitions selon la numérotation des grilles américaines qui indiquent des numéros séquentiels de cases de début de mots soit horizontalement ou verticalement. 
- acrossClues: liste de définitions horizontales indexées selon les numéros de numbers, null s'il n'y a pas de définition correspondantes
- downClues: liste de définitions horizontales indexées selon les numéros de numbers, null s'il n'y a pas de définition correspondantes