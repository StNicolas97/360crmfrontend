<template>
    <div class="affichage-view">
        <h1>Affichage</h1>
        <form @submit.prevent="login">
            <label for="nom">Nom:</label>
            <input type="text" id="nom" v-model="name">
            <input type="submit" value="Submit">
            <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
        </form>
    </div>
</template>

<script>
export default {
    name: 'AffichageView',
    data() {
        return {
            name: '',
            errorMessage: ''
        };
    },
    methods: {
        login() {
            if (this.name.trim() === '') {
                this.errorMessage = 'Veuillez entrer un texte';
            } else {
                this.errorMessage = '';
                // Ajoutez ici la logique pour soumettre le formulaire
                console.log('Nom soumis:', this.name);
            }
        }
    }
};
</script>

<style scoped>
.affichage-view {
    border-color: black;
}

.error {
    color: red;
}
</style>
