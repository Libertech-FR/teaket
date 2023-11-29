# Documentation du composant 2pan

## Sommaire

- [Documentation du composant 2pan](#documentation-du-composant-2pan)
  - [Sommaire](#sommaire)
  - [Vue d'ensemble](#vue-densemble)
  - [Structure du composant](#structure-du-composant)
    - [Caractéristiques clés](#caractéristiques-clés)
    - [Props](#props)
    - [Événements](#événements)
    - [Méthodes](#méthodes)
    - [Slots](#slots)
    - [Comportement réactif](#comportement-réactif)
  - [Exemple d'utilisation](#exemple-dutilisation)
    - [Template](#template)
    - [Actions](#actions)
    - [Configuration des colonnes](#configuration-des-colonnes)
    - [Configuration des opérations CRUD](#configuration-des-opérations-crud)

## Vue d'ensemble

Ce composant Vue est une interface complexe construite avec Quasar, intégrant un séparateur, des tables et des cartes. Il est conçu pour les opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) et est réactif aux différents types d'appareils.

## Structure du composant

Le composant est divisé en deux sections principales, contrôlées par un `q-splitter` :

1. **Section de gauche** : Contient un `q-table` pour afficher et interagir avec les données. Elle inclut des fonctionnalités pour la sélection multiple, la pagination et des colonnes personnalisables.

2. **Section de droite** : Affiche des informations détaillées ou des actions pour l'élément sélectionné dans la section de gauche. Elle est rendue dynamiquement en fonction de l'élément sélectionné. Elle est éditable grace au slot right-panel-content et les autres slots du meme type, les données de l'élement selectionné sont passées dans le slot via la props target.
Exemple :
    ```vue
    template(#right-panel-content="{target}")
    ```

### Caractéristiques clés

- Mise en page réactive avec un design adapté aux mobiles.
- Prise en charge des opérations CRUD.
- Colonnes de table personnalisables et pagination.
- Élément d'expansion pour le débogage en mode développement.

### Props

- `rowKey` : Clé pour l'identification des lignes. Par défaut : `_id`.
- `visibleColumns` : Tableau des colonnes visibles dans la table.
- `titleKey` : Clé pour le titre. Par défaut : `name`.
- `data` : Tableau d'objets de données à afficher.
- `columns` : Configuration des colonnes de la table.
- `pending` : Booléen pour l'état de chargement.
- `total` : Nombre total d'éléments.
- `crud` : Objet indiquant quelles opérations CRUD sont activées.
- `actions` : Objet contenant des fonctions pour les opérations CRUD et des actions supplémentaires comme `cancel` et `onMounted`.

### Événements

- `add` : Émis lors de l'ajout d'un nouvel élément.
- `refresh` : Émis pour rafraîchir les données.
- `read` : Émis lors de la lecture des détails d'un élément.

### Méthodes

- `cancel` : Annule l'opération en cours et réinitialise la cible.
- `read`, `create`, `update`, `remove` : Méthodes pour gérer les opérations CRUD.

### Slots

Plusieurs slots sont définis pour personnaliser différentes parties de l'interface utilisateur, y compris les boutons, les cellules de table et les sections du panneau de droite.
| Slot Name                           | Description                                           |
|-------------------------------------|----------------------------------------------------------------------|
| `top-left-btn-grp`                  | Groupe de boutons en haut à gauche.                                 |
| `top-left-btn-grp-content-before`   | Contenu personnalisable avant le groupe de boutons en haut à gauche.|
| `top-left-btn-grp-content-after`    | Contenu personnalisable après le groupe de boutons en haut à gauche.|
| `top-right-btn-grp`                 | Groupe de boutons en haut à droite.                                 |
| `top-right-btn-grp-content-before`  | Contenu personnalisable avant le groupe de boutons en haut à droite.|
| `top-right-btn-grp-content-after`   | Contenu personnalisable après le groupe de boutons en haut à droite.|
| `body-cell-actions`                 | Actions pour chaque cellule du corps du tableau.                    |
| `body-cell-actions-content-before` | Contenu personnalisable avant les actions de la cellule du corps.   |
| `body-cell-actions-content-after`  | Contenu personnalisable après les actions de la cellule du corps.   |
| `right-panel-empty`                 | Contenu pour le panneau de droite lorsqu'il est vide.               |
| `right-panel-empty-content-before` | Contenu personnalisable avant le message du panneau de droite vide. |
| `right-panel-empty-content-after`  | Contenu personnalisable après le message du panneau de droite vide. |
| `right-panel-title`                 | Titre du panneau de droite.                                         |
| `right-panel-title-before`          | Contenu personnalisable avant le titre du panneau de droite.        |
| `right-panel-title-after`           | Contenu personnalisable après le titre du panneau de droite.        |
| `right-panel-actions`               | Actions pour le panneau de droite.                                  |
| `right-panel-actions-content-before`| Contenu avant les actions du panneau de droite.                     |
| `right-panel-actions-content-after` | Contenu après les actions du panneau de droite.                     |
| `right-panel-content`               | Contenu principal du panneau de droite.                             |
| `right-panel-content-before`        | Contenu personnalisable avant le contenu principal du panneau droit.|
| `right-panel-content-after`         | Contenu personnalisable après le contenu principal du panneau droit.|

### Comportement réactif

- Ajuste la mise en page et la position du séparateur en fonction du type d'appareil (mobile ou bureau).
- Cache certains éléments de l'interface utilisateur sur mobile pour une meilleure utilisabilité.

## Exemple d'utilisation

### Template
```pug
<template lang="pug">
tk-2pan(
  :data="identities.data"
  :total="identities.total"
  :pending="pending"
  :refresh="refresh"
  :columns="columns"
  :crud="crud"
  :actions="actions"
  title="Mails"
  title-key="displayName"
)
  template(#right-panel-content="{target}")
    .row
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='nom d\'utilisateur'
          v-model='target.username'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='nom d\'affichage'
          v-model='target.displayName'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        tk-form-autocomplete(
          label='Entitée'
          v-model='target.entityId'
          filled
          v-bind='entityConfig'
        )
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='Email'
          v-model='target.email'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        q-select.q-my-xs(
          label='Status'
          v-model='target.state.current'
          filled
        )
</template>
```

### Actions
```ts
const actions = {
  create: async (identity: Identity) => {
    const { data, error } = await useHttpApi(`/core/identities`, {
      method: 'post',
      body: {
        ...identity,
      },
    })
    if (error.value) {
      $q.notify({
        color: 'negative',
        message: error.value?.data?.message || error.value?.message,
      })
      return identity
    }
    $q.notify({
      color: 'positive',
      message: 'Email importé avec succès',
    })
    await refresh()
    return null
  },

  read: async (identity: Identity) => {
    router.replace({
      query: {
        ...route.query,
        _id: identity?._id,
      },
    })
    const { data } = await useHttpApi(`/core/identities/{_id}`, {
      method: 'get',
      pathParams: {
        _id: identity._id,
      },
    })
    return data.value?.data
  },

  update: async (identity: Identity) => {
    const { data, error } = await useHttpApi(`/core/identities/{_id}`, {
      method: 'patch',
      pathParams: {
        _id: identity._id,
      },
      body: omit(identity, ['_id', 'metadata']),
    })
    if (error.value) {
      $q.notify({
        color: 'negative',
        message: error.value?.data?.message || error.value?.message,
      })
      return identity
    }
    $q.notify({
      color: 'positive',
      message: 'Compte modifié avec succès',
    })
    await refresh()
    return null
  },

  delete: async (identity: Identity) => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Suppression',
        message: 'Vous êtes sur le point de supprimer un compte, êtes-vous sûr ?',
        cancel: true,
        persistent: true,
        color: 'negative',
      })
        .onOk(async () => {
          const { error } = await useHttpApi(`/core/identities/{_id}`, {
            method: 'delete',
            pathParams: {
              _id: identity._id,
            },
          })
          if (error.value) {
            $q.notify({
              color: 'negative',
              message: `Impossible de supprimer le compte: ${identity._id}`,
            })
            return resolve(identity)
          }
          $q.notify({
            color: 'positive',
            message: 'Compte supprimé avec succès',
          })
          await refresh()
          return resolve(null)
        })
        .onCancel(() => {
          return resolve(identity)
        })
    })
  },

  cancel: async () => {
    await router.replace({
      query: omit(route.query, ['_id']),
    })
  },
  onMounted: async () => {
    if (route.query._id) {
      return await actions.read(route.query)
    }
  },
}
```

### Configuration des colonnes
Voir les props column de [Quasar Table](https://quasar.dev/vue-components/table#QTable-API) pour plus d'informations.

### Configuration des opérations CRUD
```ts
const crud = {
  create: true,
  read: true,
  update: true,
  delete: true,
}
```