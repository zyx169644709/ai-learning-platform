import { ref } from 'vue'

const quizOpen = ref(false)

export const useQuizState = () => ({ quizOpen })
