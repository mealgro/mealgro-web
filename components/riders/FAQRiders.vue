<template>
  <section class="w-full faq-section">
    <!-- Desktop Layout -->
    <div class="faq-desktop bg-[#D62300] py-16 md:py-24">
      <div class="container mx-auto px-4 md:px-8 relative">
        <!-- Title Container -->
        <div class="w-full max-w-[1235px] h-[138.42px] bg-[#D62300] rounded-[60px] mx-auto mb-8 -mb-16 md:-mb-20 relative z-10 flex items-center justify-center">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
            Frequently asked questions
          </h2>
        </div>
        
        <!-- Main Content Area -->
        <div class="bg-white rounded-3xl p-8 md:p-12 pt-24 md:pt-28 relative z-0">
          <!-- Switch Container (Visual Only) -->
          <div class="w-full max-w-[1110.74px] h-[138.42px] bg-[#F2F2F2] rounded-[37px] flex relative mx-auto mb-8">
            <!-- Questions Tab -->
            <div
              class="flex-1 h-full flex items-center justify-center"
              :class="activeTab === 'questions' ? 'bg-[#FFE100] rounded-[37px] shadow-[4px_4px_8px_rgba(0,0,0,0.15)]' : 'bg-transparent rounded-l-[37px] rounded-r-0'"
            >
              <span class="font-bold text-2xl md:text-3xl text-black">Questions</span>
            </div>
            
            <!-- Answers Tab -->
            <div
              class="flex-1 h-full rounded-r-[37px] rounded-l-0 flex items-center justify-center"
              :class="activeTab === 'answers' ? 'bg-yellow-400' : 'bg-transparent'"
            >
              <span class="font-bold text-2xl md:text-3xl text-black">Answers</span>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <!-- Left: Questions Column -->
            <div class="flex flex-col">
              <div class="flex flex-col gap-4">
                <button
                  v-for="(question, index) in questions"
                  :key="index"
                  @click="selectQuestion(index)"
                  class="text-left px-6 py-4 rounded-xl transition-colors duration-200"
                  :class="selectedQuestion === index ? 'bg-gray-200' : 'bg-transparent'"
                >
                  <span class="font-medium text-lg text-black">{{ question }}</span>
                </button>
              </div>
            </div>

            <!-- Right: Answers Column -->
            <div class="flex flex-col">
              <div class="bg-[#FFE100] rounded-[54px] w-full max-w-[548px] h-auto min-h-[417.03px] p-16 md:p-14 relative">
                <!-- Star Icons (Top Right) -->
                <div class="absolute top-8 right-8 flex gap-2">
                  <img :src="starIcon" alt="Star" class="w-10 h-10 object-contain" />
                </div>
                
                <!-- Answer Text -->
                <p class="text-[24px] leading-[40px] tracking-[-0.25px] text-black w-full max-w-[400.91px]">
                  {{ answers[selectedQuestion] }}
                </p>
                
                <!-- Navigation Button (Bottom Right) -->
                <button
                  @click="nextQuestion"
                  class="absolute bottom-8 right-8 bg-gray-100 text-black rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Layout -->
    <div class="faq-mobile">
      <!-- Header -->
      <h2 class="mobile-faq-title">FAQs</h2>

      <!-- Main Content Card -->
      <div class="mobile-faq-card">
        <!-- Question Row -->
        <div class="mobile-question-row">
          <p class="mobile-question-text">{{ questions[selectedQuestion] }}</p>
          <button class="mobile-questions-btn">
            <span>Questions</span> 
          </button>
        </div>

        <!-- Answer Block -->
        <div class="mobile-answer-block">
          <!-- Sparkles Icon (Top Right) -->
          <div class="mobile-sparkles-icon">
            <img :src="starIcon" alt="Sparkles" class="w-8 h-8 object-contain" style="filter: brightness(0);" />
          </div>
          
          <!-- Answer Text -->
          <p class="mobile-answer-text">
            {{ answers[selectedQuestion] }}
          </p>
          
          <!-- See More Button (Bottom Center) -->
          <button class="mobile-see-more-btn" @click="nextQuestion">
            <span>See more</span>
            <div class="mobile-btn-arrow-circle">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import starIcon from '../../assets/faq/star.svg';

const activeTab = ref<'questions' | 'answers'>('questions');
const selectedQuestion = ref(0);

const questions = [
  'Can an external rider join MealGro?',
  'How do riders get paid?',
  'Must riders have a high-end smart phone?',
  'Is it available in Abuja?'
];

const answers = [
  'External riders can enlist on the MealGro app as delivery agents. They carry MealGro deliveries and earn fairly for every completed trip.',
  'Riders get paid for each fulfilled order, with earnings tracked in-app and settled promptly to their preferred payout account.',
  'No, you just need a reliable smartphone with internet access. The MealGro rider app runs smoothly on most mid-range Android and iOS devices.',
  'Yes, the MealGro rider network is active in Abuja and continues to expand into nearby neighborhoods.'
];

const selectQuestion = (index: number) => {
  selectedQuestion.value = index;
};

const nextQuestion = () => {
  selectedQuestion.value = (selectedQuestion.value + 1) % questions.length;
};
</script>

<style scoped>
/* Hide mobile layout on desktop */
.faq-mobile {
  display: none;
}

/* Hide desktop layout on mobile/tablet */
@media (max-width: 1024px) {
  .faq-section {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    background: white;
  }

  .faq-desktop {
    display: none;
  }

  .faq-mobile {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 32px 0 0 0;
    background: white;
    overflow-x: visible;
    overflow-y: hidden;
    position: relative;
  }

  .mobile-faq-title {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    line-height: 40px;
    text-align: center;
    color: #121212;
    margin: 0 0 24px 0;
  }

  .mobile-faq-card {
    box-sizing: border-box;
    position: relative;
    width: 100vw;
    max-width: 100vw;
    left: calc(-50vw + 50%);
    background: #F5F4F0;
    border-radius: 50px;
    padding: 24px 20px 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: visible;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }

  .mobile-question-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .mobile-question-text {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
    color: #121212;
    margin: 0;
    flex: 1;
  }

  .mobile-questions-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #D62300;
    border: none;
    border-radius: 999px;
    padding: 10px 22px;
    color: white;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .mobile-answer-block {
    box-sizing: border-box;
    position: relative;
    width: 100vw;
    max-width: 100vw;
    min-height: 420px;
    left: calc(-50vw + 50%);
    background: #FFE100;
    border: none;
    border-top-left-radius: 80px;
    border-top-right-radius: 80px;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
    padding: 48px 28px 96px 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    margin-top: 16px;
    margin-bottom: -20px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }

  .mobile-sparkles-icon {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .mobile-answer-text {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 35px;
    letter-spacing: -0.25px;
    color: #000000;
    margin: 0;
    text-align: left;
    padding-top: 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 95vw;
    margin: 0 auto;
  }

  .mobile-see-more-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #000000;
    border: none;
    border-radius: 999px;
    padding: 18px 26px;
    color: white;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    width: 85vw;
    max-width: 85vw;
    position: relative;
    margin: 0 auto;
  }

  .mobile-see-more-btn span {
    flex: 1;
    text-align: center;
  }

  .mobile-btn-arrow-circle {
    width: 34px;
    height: 34px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-btn-arrow-circle svg {
    width: 16px;
    height: 16px;
    color: #000000;
  }
}

@media (max-width: 768px) {
  .faq-mobile {
    padding: 24px 0 0 0;
    overflow-y: hidden;
  }

  .mobile-faq-title {
    font-size: 28px;
    line-height: 36px;
    margin-bottom: 20px;
    padding: 0 16px;
  }

  .mobile-faq-card {
    width: 100vw;
    max-width: 100vw;
    left: calc(-50vw + 50%);
    padding-top: 70px;
    border-radius: 50px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    
  }

  .mobile-question-text {
    font-size: 24px;
    line-height: 22px;
  }

  .mobile-questions-btn {
    padding: 10px 25px;
    font-size: 18px;
    border-radius: 25px;
  }

  .mobile-answer-block {
    width: 100vw;
    max-width: 100vw;
    height: auto;
    min-height: 450px;
    left: calc(-50vw + 50%);
    border-top-left-radius: 50px;
    border-top-right-radius: 50px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 50px 20px 70px 2px;
    margin-bottom: -15px;
  }

  .mobile-answer-text {
    font-size: 20px;
    line-height: 33px;
    letter-spacing: -0.25px;
    padding-top: 6px;
    width: 85vw;
    max-width: 85vw;
  }

  .mobile-see-more-btn {
    padding: 14px 20px;
    font-size: 16px;
    width: 85vw;
    max-width: 85vw;
  }

  .mobile-btn-arrow-circle {
    width: 28px;
    height: 28px;
  }

  .mobile-btn-arrow-circle svg {
    width: 14px;
    height: 14px;
  }

  .mobile-answer-text {
    font-size: 22px;
    line-height: 35px;
    padding: 10px;
  }

  .mobile-see-more-btn {
    padding-bottom: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 24px;
    border-radius: 35px;
  }
}
</style>

