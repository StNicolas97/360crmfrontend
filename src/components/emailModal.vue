<template>
<!-- Modal -->
<div class="modal fade" id="emailModal" tabindex="-1" role="dialog" aria-labelledby="emailModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Envoyer un Rappel</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="sendEmail">
                        <div class="form-group">
                                <label for="recipientEmail">Destinataire</label>
                                <input type="text" class="form-control" id="recipientEmail" v-model="email.recipient" required>
                        </div>
                        <div class="form-group">
                                <label for="emailSubject">Objet</label>
                                <input type="text" class="form-control" id="emailSubject" v-model="email.subject" required>
                        </div>
                        <div class="form-group">
                                <label for="emailBody">Message</label>
                                <textarea class="form-control" id="emailBody" v-model="email.body" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-danger">Envoyer</button>
                </form>
            </div>
        </div>
    </div>
</div>
</template>


<script>
import { addService } from '@/api/services/add.service';
export default {
    name :'EmailModal',
    data() {
        return {
            email: {
                recipient: this.mail,
                subject: "Rappel : suivi de votre projet chez 360 AutoWrap",
                body: `Bonjour ${this.nom} ${this.prenom},
                Nous souhaitons vous rappeler que votre projet est toujours en cours chez 360 AutoWrap.
                N’hésitez pas à nous contacter pour toute précision ou pour confirmer la prochaine étape.
                Cordialement,
                L’équipe 360AutoWrap`
            }
        }
    },
    props : {
        mail : {
            type : String,
            default : ''
        },
        nom : {
            type : String,
            default : ''
        },
        prenom : {
            type : String,
            default : ''
        },
        entreprise : {
            type : String,
            default : ''
        }
    },
    created(){
        console.log("voici l'email" + this.mail)
    },
    methods: {
        async sendEmail() {
            try{
                const response = await addService.addMail(this.email);
                if(!response) throw new Error();
                const modal = document.getElementById('emailModal');
                const bootstrapModal = bootstrap.Modal.getInstance(modal)
                bootstrapModal.hide()
            }catch(error){
                console.log(error);
            }
        }
    }
};
</script>


<style>
</style>
