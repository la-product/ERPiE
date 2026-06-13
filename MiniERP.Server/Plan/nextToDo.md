# Plan vyvoje


## Prijemky
	Do tabulky Customer, pridat bool pro dodavatele, muze byt zaroveni Zakaznik a Dodavatel
	Pri mi graci se vytvori nove sloupce v tabulce
### Seznam prijemek
	Seznam kde budou uvedeny vsechny prijate faktury
### Pridat doklad
	Id
	Dodavatel
	Datum prijmu
	Cislo dokladu faktury prijate
	Produkt
	Cena produktu bez DPH + DPH
	Mnozsvi produktu
	Je treba po pridani dokladu automaticky pridat polozku na sklad pokud, 
	pripadne navysit skladouvy stav produktu. Take prijemku uvest v hlavni ucetni knize.
	
## Product List
	Zrusit skladovou zasobu
	Pridat kategorii (Letni, Zimni, Celorocni)

## Vytvoreni Skladu
	Ve skladu vytvorit podsekce Vse, Osobni, Nakladni,

## Hlavni Ucetni Kniha
	Obsahuje veskere doklad (prijate faktury, vydane faktury)
## Faktura
	Format faktury k tisku a poslani pdf soubouru.
	Zjistit, co ma takovy template obsahovat
## Objednavky/Dodaci list
	Pokud je k objednavce jiz vytvorena faktura, tak pri Create Invoice otevrit jiz tu sparovnou
