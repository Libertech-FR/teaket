# Documentation du Composant Formulaire Dynamique

## Sommaire

- [Documentation du Composant Formulaire Dynamique](#documentation-du-composant-formulaire-dynamique)
  - [Sommaire](#sommaire)
  - [Introduction](#introduction)
  - [Structure du JSON de Configuration](#structure-du-json-de-configuration)
    - [Champ `title`](#champ-title)
    - [Champ `description`](#champ-description)
    - [Champ `type`](#champ-type)
    - [Champ `defaultValues`](#champ-defaultvalues)
    - [Champ `sections`](#champ-sections)
      - [Exemple de section](#exemple-de-section)
    - [Champs dans fields](#champs-dans-fields)
      - [Exemple de champ](#exemple-de-champ)
    - [Autres champs importants](#autres-champs-importants)
  - [Exemple complet d'un json de formulaire pour la creation de ticket](#exemple-complet-dun-json-de-formulaire-pour-la-creation-de-ticket)
  - [Documentation des Composants Vue.js](#documentation-des-composants-vuejs)
    - [`builder.vue`](#buildervue)
      - [Aperçu](#aperçu)
      - [Structure](#structure)
      - [Fonctionnalités](#fonctionnalités)
      - [Script](#script)
    - [`tk-form-type.vue`](#tk-form-typevue)
      - [Aperçu](#aperçu-1)
      - [Structure](#structure-1)
      - [Fonctionnalités](#fonctionnalités-1)
  - [Types de formulaires](#types-de-formulaires)
    - [`tk-form-stepper`](#tk-form-stepper)
      - [Aperçu](#aperçu-2)
      - [Structure](#structure-2)
      - [Fonctionnalités](#fonctionnalités-2)
    - [`tk-form-tabs`](#tk-form-tabs)
      - [Aperçu](#aperçu-3)
      - [Structure](#structure-3)
      - [Fonctionnalités](#fonctionnalités-3)
    - [`tk-form-base`](#tk-form-base)
      - [Aperçu](#aperçu-4)
      - [Structure](#structure-4)
      - [Fonctionnalités](#fonctionnalités-4)
    - [Énumérations et Types](#énumérations-et-types)
      - [`FormTypes`](#formtypes)
      - [`CRUDMode`](#crudmode)
      - [`TicketFormField` et `TicketFormSection`](#ticketformfield-et-ticketformsection)

## Introduction
Cette documentation décrit le composant de formulaire dynamique utilisé dans les applications avec NestJS et Mongoose, en utilisant des composants du framework Quasar. Le formulaire est construit dynamiquement à partir d'une configuration JSON.
Ce fichier json est stocké dans la base de données et est récupéré par l'API pour construire le formulaire, tout est géré dans le module nestjs `/tickets/form`

## Structure du JSON de Configuration

### Champ `title`
- **Type**: `string`
- **Description**: Titre du formulaire.
- **Exemple**: `"title": "Creation de ticket"`

### Champ `description`
- **Type**: `string`
- **Description**: Description ou instructions pour le formulaire.
- **Exemple**: `"description": "Veuillez remplir le formulaire ci-dessous pour créer un nouveau ticket."`

### Champ `type`
- **Type**: `number`
- **Description**: Type de formulaire, représenté par un numéro (par exemple, 0 pour base, 1 pour étapes).
- **Exemple**: `"type": 1`

### Champ `defaultValues`
- **Type**: `object`
- **Description**: Valeurs par défaut pour certains champs du formulaire.
- **Exemple**: `"defaultValues": { "lifestep": 1 }`

### Champ `sections`
- **Type**: `object`
- **Description**: Sections du formulaire, chacune contenant ses propres champs.
- **Sous-champs**:
  - `label`: Nom de la section.
  - `type`: Type de la section (similaire au type de formulaire).
  - `description`: Description de la section.
  - `icon`: Icône représentant la section.
  - `fields`: Champs de la section.

#### Exemple de section
```json
"sections": {
  "envelope": {
    "label": "Enveloppe",
    "type": 0,
    "description": "Veuillez remplir les champs ci-dessous pour créer une nouvelle enveloppe.",
    "icon": "mdi-email",
    "fields": {
      // Définition des champs ici...
    }
  }
}
```

### Champs dans fields
Chaque champ dans fields est un objet avec les propriétés suivantes :

- ``component``: Type de composant Quasar à utiliser (par exemple, autocomplete).
- ``label``: Étiquette du champ.
- ``model-value``: Chemin de liaison de données pour le champ.
- ``row et col``: Positionnement du champ dans une grille.
- ``attrsOnDefault``, ``attrsOnCreate``, ``attrsOnRead``, ``attrsOnUpdate``, ``attrsOnDelete``: Objets définissant les attributs et comportements du champ dans différents états. Pour connaître les attributs disponibles, consultez la documentation de Quasar Framework. Les composants disponibles sont les suivants : 
  - [select](https://quasar.dev/vue-components/select#qselect-api)
  - [input](https://quasar.dev/vue-components/input#qinput-api)
  - [autocomplete](https://quasar.dev/vue-components/autocomplete#qautocomplete-api)
  - [checkbox](https://quasar.dev/vue-components/checkbox#qcheckbox-api)
  - [radio](https://quasar.dev/vue-components/radio#qradio-api)

#### Exemple de champ
```json
"senders": {
  "component": "autocomplete",
  "label": "Appelant",
  "model-value": "envelope.senders",
  "attrsOnDefault": {
    "filled": true,
    "dense": true,
    // Autres attributs...
  },
    "attrsOnCreate": {
        // Autres attributs...
    },
    "attrsOnRead": {
        "disable": true
        // Autres attributs...
    },
    "attrsOnUpdate": {
        // Autres attributs...
    },
    "attrsOnDelete": {
        "disable": true
        // Autres attributs...
    },
  "row": 1,
  "col": 4
}
```

### Autres champs importants
- ``submitButtonText``: Texte du bouton de soumission.
- ``submitApiUrl``: URL à appeler lors de la soumission du formulaire.
- ``redirectUrl``: URL de redirection après la soumission, l'id de la nouvelle entrée est automatiquement ajoutée a la fin de l'url.


## Exemple complet d'un json de formulaire pour la creation de ticket

```json
{
  "title": "Creation de ticket",
  "description": "Veuillez remplir le formulaire ci-dessous pour créer un nouveau ticket.",
  "type": 1,
  "defaultValues": {
    "lifestep": 1
  },
  "sections": {
    "envelope": {
      "label": "Enveloppe",
      "type": 0,
      "description": "Veuillez remplir les champs ci-dessous pour créer une nouvelle enveloppe.",
      "icon": "mdi-email",
      "fields": {
        "senders": {
          "component": "autocomplete",
          "label": "Appelant",
          "model-value": "envelope.senders",
          "attrsOnDefault": {
            "apiUrl": "/core/entities",
            "optionLabel": "name",
            "modelLabel": "name",
            "searchField": "profile.commonName",
            "dense": true,
            "multiple": true,
            "filled": true,
            "transformKeys": {
              "_id": "id",
              "profile.commonName": "name",
              "type": "type"
            }
          },
          "row": 1,
          "col": 4,
          "attrsOnCreate": {
            "disable": false
          },
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {
            "disable": false
          },
          "attrsOnDelete": {
            "disable": true
          }
        },
        "observers": {
          "component": "autocomplete",
          "label": "Concernés",
          "model-value": "envelope.observers",
          "attrsOnDefault": {
            "apiUrl": "/core/entities",
            "optionLabel": "name",
            "modelLabel": "name",
            "searchField": "profile.commonName",
            "dense": true,
            "multiple": true,
            "filled": true,
            "transformKeys": {
              "_id": "id",
              "profile.commonName": "name",
              "type": "type"
            }
          },
          "row": 1,
          "col": 4,
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "assigned": {
          "component": "autocomplete",
          "label": "Assignés",
          "model-value": "envelope.assigned",
          "attrsOnDefault": {
            "apiUrl": "/core/entities",
            "optionLabel": "name",
            "searchField": "profile.commonName",
            "modelLabel": "name",
            "dense": true,
            "multiple": true,
            "filled": true,
            "additionalFilters": [
              {
                "field": "type",
                "value": 2,
                "operator": "<=#"
              }
            ],
            "transformKeys": {
              "_id": "id",
              "profile.commonName": "name",
              "type": "type"
            }
          },
          "row": 1,
          "col": 4,
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        }
      }
    },
    "infos": {
      "label": "Informations",
      "type": 0,
      "description": "Veuillez remplir les champs ci-dessous pour renseigner les informations du ticket.",
      "icon": "mdi-information",
      "fields": {
        "subject": {
          "component": "input",
          "label": "Sujet",
          "model-value": "subject",
          "row": 1,
          "col": 12,
          "attrsOnDefault": {
            "dense": true,
            "filled": true
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "project": {
          "component": "autocomplete",
          "label": "Projet(s)",
          "model-value": "project",
          "row": 2,
          "col": 6,
          "attrsOnDefault": {
            "apiUrl": "/core/project",
            "optionLabel": "name",
            "modelLabel": "name",
            "searchField": "name",
            "dense": true,
            "multiple": true,
            "filled": true,
            "transformKeys": {
              "_id": "id",
              "name": "name"
            }
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "priority": {
          "component": "select",
          "label": "Priorité",
          "model-value": "priority",
          "row": 3,
          "col": 6,
          "attrsOnDefault": {
            "options": [
              {
                "id": "612345678901234567890123",
                "name": "Low"
              },
              {
                "id": "712345678901234567890123",
                "name": "Normal"
              },
              {
                "id": "812345678901234567890123",
                "name": "High"
              },
              {
                "id": "912345678901234567890123",
                "name": "Urgent"
              }
            ],
            "option-label": "name",
            "dense": true,
            "filled": true
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "impact": {
          "component": "select",
          "label": "Impact",
          "model-value": "impact",
          "row": 3,
          "col": 6,
          "attrsOnDefault": {
            "options": [
              {
                "id": "612345678901234567890123",
                "name": "Low"
              },
              {
                "id": "712345678901234567890123",
                "name": "Medium"
              },
              {
                "id": "812345678901234567890123",
                "name": "High"
              },
              {
                "id": "912345678901234567890123",
                "name": "Critical"
              }
            ],
            "option-label": "name",
            "dense": true,
            "filled": true
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "sla": {
          "component": "autocomplete",
          "label": "SLA",
          "model-value": "sla",
          "row": 2,
          "col": 6,
          "attrsOnDefault": {
            "apiUrl": "/tickets/sla",
            "optionLabel": "name",
            "modelLabel": "name",
            "searchField": "name",
            "dense": true,
            "multiple": true,
            "filled": true,
            "transformKeys": {
              "_id": "id",
              "name": "name"
            }
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        },
        "type": {
          "component": "select",
          "label": "Type",
          "model-value": "type",
          "row": 3,
          "col": 6,
          "attrsOnDefault": {
            "options": [
              {
                "value": 1,
                "name": "Incident"
              },
              {
                "value": 2,
                "name": "Demande"
              }
            ],
            "option-label": "name",
            "emit-value": true,
            "options-map": true,
            "dense": true,
            "filled": true
          },
          "attrsOnCreate": {},
          "attrsOnRead": {
            "disable": true
          },
          "attrsOnUpdate": {},
          "attrsOnDelete": {
            "disable": true
          }
        }
      }
    }
  },
  "submitButtonText": "Soumettre le formulaire",
  "submitApiUrl": "/tickets/ticket",
  "redirectUrl": "/ticket"
}
```

## Documentation des Composants Vue.js

### `builder.vue`

#### Aperçu
Le composant `builder.vue` est un constructeur de formulaires dynamique utilisant les composants du Framework Quasar. Il est conçu pour les opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) et prend en charge différents types de champs et de dispositions.

#### Structure
- **QCard** : Conteneur principal avec une barre d'outils affichant le titre et la description du formulaire.
- **TkFormType** : Composant personnalisé rendant les champs de formulaire basés sur la structure JSON fournie.
- **QCardActions** : Contient des boutons d'action et des emplacements pour des actions personnalisées.

#### Fonctionnalités
- Rendu dynamique des champs de formulaire.
- Prise en charge de plusieurs modes CRUD.
- Personnalisable via des emplacements (slots).

#### Script
- Utilise l'API de Composition Vue 3.
- Méthodes `reset`, `resetValidation` et `submit` pour les interactions avec le formulaire.
- Émet un événement `submit` avec les données du formulaire.

---

### `tk-form-type.vue`

#### Aperçu
Composant pour rendre différents types de dispositions de formulaire : `base`, `stepper`, `tabs`.

#### Structure
- Composant dynamique basé sur la propriété `type`.
- Prend en charge différentes structures de formulaire telles que le formulaire de base, le stepper et les onglets.

#### Fonctionnalités
- Rendu flexible basé sur la propriété `type`.
- Utilise des propriétés calculées pour déterminer la disposition du formulaire.

---

## Types de formulaires

### `tk-form-stepper`

#### Aperçu
Un composant de type stepper pour naviguer à travers différentes sections de formulaire.

#### Structure
- **QStepper** : Composant stepper de Quasar pour la navigation entre les sections.
- Étapes générées dynamiquement en fonction de la propriété `sections`.

#### Fonctionnalités
- Prend en charge la navigation à travers les sections du formulaire.
- Crée dynamiquement des étapes basées sur les données fournies.

---

### `tk-form-tabs`

#### Aperçu
Disposition de formulaire basée sur des onglets pour organiser les sections de formulaire.

#### Structure
- **QTabs** : Conteneur pour les en-têtes des onglets.
- **QTabPanels** : Panneaux qui rendent le contenu de chaque onglet.

#### Fonctionnalités
- Permet de passer entre les sections du formulaire à l'aide d'onglets.
- Génère dynamiquement des onglets en fonction des données fournies.

---

### `tk-form-base`

#### Aperçu
Disposition de formulaire de base avec un système de grille pour le placement des champs.

#### Structure
- Utilise une classe `.row` pour organiser les champs en lignes.
- Crée dynamiquement des champs de formulaire en fonction de la propriété `fields`.

#### Fonctionnalités
- Disposition de grille flexible pour les champs de formulaire.
- Rendu de composant personnalisé pour chaque champ.

---

### Énumérations et Types

#### `FormTypes`
Définit différents types de dispositions de formulaire : Base, Étapes, Onglets.

#### `CRUDMode`
Définit les opérations CRUD : Créer, Lire, Mettre à jour.

#### `TicketFormField` et `TicketFormSection`
Types définissant la structure des champs de formulaire et des sections.
