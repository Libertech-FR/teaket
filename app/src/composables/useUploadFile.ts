import { ref } from 'vue'
import { ObjectID } from 'bson'
import { useRoute } from 'vue-router'
import { useHttpApi } from './useHttpApi'
import { generateMongoId } from '~/utils/mongoId'
import { useDropZone } from '~/composables/useDropZone'
import { FsType } from '~/utils'
import { components } from '~/types/generated'
import { useQuasar } from 'quasar'

export default function useUploadFile(isDisabledTicket: Ref<boolean> = ref(false)) {
const $q = useQuasar()
const attachments = ref<FsPart[]>([])
// Manage dropzone
const onDrop = async (files: File[] | null, filePath: string) => {
    if (isDisabledTicket.value) {
      $q.notify({
        message: "Impossible d'envoyer le fichier, le ticket est fermé",
        type: 'negative',
      })
      return
    }
    if (!files) {
      $q.notify({
        message: "Impossible d'envoyer le fichier",
        type: 'negative',
      })
      return
    }
    const fsParts: FsPart = []
    for (const file of files) {
      const fsPart = await uploadFile(file, filePath)
        if (fsPart) {
            fsParts.push(fsPart)
        }
    }
    attachments.value = [...attachments.value, ...fsParts]
    return fsParts
  }
  
  // Manage attachements
  type FsPart = components['schemas']['IdfsPartDto']
  type FilestorageCreateDto = components['schemas']['FilestorageCreateDto']
  const attachements = ref<FsPart[]>([])

  const uploadFile = async (file: File, filePath: string) => {
    const { data, error } = await apiCall(file, filePath)
    if (error.value) {
      $q.notify({
        message: "Impossible d'envoyer le fichier",
        type: 'negative',
      })
      return
    }
    const id = generateMongoId(data.value?.data?._id).toHexString()
    const fsPart: FsPart = {
      id,
      name: file.name,
      namespace: data.value?.data?.namespace || '',
      path: data.value?.data?.path || '',
      mime: data.value?.data?.mime || '',
    }
    $q.notify('Fichier envoyé')
    return fsPart
  }

  const apiCall = async (file: File, path: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('namespace', 's3')
    //formData.append('path', `/ticket/${route.params.id}/attachement/${currentThreadId.value}/${file.name}`)
    formData.append('path', `${path}/${file.name}`)
    formData.append('type', FsType.FILE)
    return useHttpApi(`/core/filestorage`, {
      method: 'post',
      body: formData as unknown as FilestorageCreateDto,
    })
  }
  
  const removeAttachment = async (id: string) => {
    const { data, error } = await useHttpApi(`/core/filestorage/{_id}`, {
      method: 'delete',
      pathParams: {
        _id: id,
      },
    })
    if (error.value) {
      $q.notify({
        message: 'Impossible de supprimer le fichier',
        type: 'negative',
      })
      return false
    }
    $q.notify('Fichier supprimé')
    attachments.value = attachments.value.filter((attachment) => attachment.id !== id)
    return id
  }

  return {
    onDrop,
    uploadFile,
    removeAttachment,
    apiCall,
    attachments,
  }
}