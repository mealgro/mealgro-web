<template>
	<section class="joinus-section">
		<div class="joinus-container">
			<div class="joinus-media">
				<div class="media-wrapper">
					<div
						v-for="(image, index) in carouselImages"
						:key="index"
						class="media-slide"
						:class="{ 'is-active': currentSlide === index }"
					>
						<img :src="image" alt="Happy delivery partner" />
					</div>
				</div>
				<div class="media-indicators">
					<button
						v-for="(image, index) in carouselImages"
						:key="index"
						type="button"
						class="indicator"
						:class="{ 'indicator--active': currentSlide === index }"
						aria-label="Show partner photo"
						@click="goToSlide(index)"
					/>
				</div>
			</div>
			<div class="joinus-form-card">
				<h2 class="form-title">Join us today!</h2>
				<form
					class="form-grid"
					action="https://api.web3forms.com/submit"
					method="POST"
				>
					<input
						type="hidden"
						name="access_key"
						value="207fc7d7-da00-4dee-adf9-1dc4ca7cf3c4"
					/>
					<label class="form-field">
						<span>Full name</span>
						<input
							type="text"
							name="full_name"
							placeholder=""
							required
						/>
					</label>
					<label class="form-field">
						<span>Phone number</span>
						<input
							type="tel"
							name="phone"
							placeholder="+23490XXXXXXXX"
							required
						/>
					</label>
					<label class="form-field">
						<span>Email</span>
						<input
							type="email"
							name="email"
							placeholder=""
							required
						/>
					</label>
					<label class="form-field">
						<span>State</span>
						<input
							type="text"
							name="state"
							class="form-input"
							required
						/>
					</label>
					<label class="form-field">
						<span>City</span>
						<input
							type="text"
							name="city"
							class="form-input"
							required
						/>
					</label>
					<label class="form-field">
						<span>Address</span>
						<input
							type="text"
							name="address"
							class="form-input"
							required
						/>
					</label>
					<button
						type="submit"
						class="form-submit bg-[#FF2509] hover:bg-[#FF2509]/90 focus-within:bg-[#FF2509]/80"
					>
						Submit
					</button>
				</form>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import workingManImage from "../../assets/riders/workingman.jpg";
import riderBackPack from "../../assets/riders/rider_backpack.png";
import riderDelivery from "../../assets/riders/rider_deliver.png";
import riderInDelivery from "../../assets/riders/rider_in_delivery.jpg";
import riderInDelivery2 from "../../assets/riders/rider_in_delivery_2.jpg";

const carouselImages = [
	workingManImage,
	riderBackPack,
	riderDelivery,
	riderInDelivery,
	riderInDelivery2,
];
const currentSlide = ref(0);

let autoSlideInterval: ReturnType<typeof setInterval> | null = null;

const goToSlide = (index: number) => {
	currentSlide.value = index;
	resetAutoSlide();
};

const nextSlide = () => {
	currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
};

const resetAutoSlide = () => {
	if (autoSlideInterval) {
		clearInterval(autoSlideInterval);
	}
	autoSlideInterval = setInterval(nextSlide, 6000);
};

onMounted(() => {
	resetAutoSlide();
});

onUnmounted(() => {
	if (autoSlideInterval) {
		clearInterval(autoSlideInterval);
	}
});
</script>

<style scoped>
.joinus-section {
	width: 100%;
	padding: clamp(72px, 10vw, 120px) clamp(16px, 5vw, 72px);
	background: #f4f4f4;
	display: flex;
	justify-content: center;
}

.joinus-container {
	width: 100%;
	max-width: 1180px;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: clamp(32px, 6vw, 72px);
	align-items: center;
}

.joinus-media {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24px;
}

.media-wrapper {
	position: relative;
	width: min(520px, 90%);
	height: 630px;
	border-radius: 54px;
	overflow: hidden;
}

.media-slide {
	position: absolute;
	inset: 0;
	opacity: 0;
	transition: opacity 0.5s ease;
}

.media-slide.is-active {
	opacity: 1;
	z-index: 1;
}

.media-slide img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.media-indicators {
	width: min(340px, 90%);
	display: flex;
	align-items: center;
	gap: 4px;
}

.indicator {
	flex: 1;
	height: 4px;
	border: none;
	border-radius: 999px;
	background: #ffe0dc;
	cursor: pointer;
	transition: background 0.3s ease;
}

.indicator--active {
	background: #ff2509;
}

.joinus-form-card {
	position: relative;
	width: 100%;
	max-width: 580px;
	background: #ffffff;
	border-radius: 40px;
	padding: clamp(32px, 5vw, 48px);
	box-shadow: 0 32px 80px rgba(0, 0, 0, 0.05);
}

.form-title {
	margin: 0 0 clamp(12px, 2vw, 16px);
	font-family: "MADE Tommy Soft", sans-serif;
	font-style: normal;
	font-weight: 500;
	font-size: 50px;
	line-height: 54px;
	letter-spacing: -0.25px;
	text-align: left;
	color: #000000;
	width: 455px;
	height: 110px;
}

.form-grid {
	display: flex;
	flex-direction: column;
	gap: clamp(20px, 3vw, 28px);
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-family: "MADE Tommy Soft", sans-serif;
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	letter-spacing: -0.25px;
	color: #000000;
	margin-bottom: 14px;
	width: 100%;
	position: relative;
}

.form-field span {
	opacity: 0.7;
}

.form-field input {
	border: none;
	border-bottom: 1px solid #c8c8c8;
	padding: 8px 0;
	font-size: 18px;
	font-family: inherit;
	background: transparent;
	color: #121212;
}

.form-field input:focus {
	outline: none;
	border-bottom-color: #ff2509;
}

.form-submit {
	margin-top: clamp(24px, 3vw, 40px);
	width: 100%;
	padding: clamp(20px, 3vw, 28px);
	border: none;
	border-radius: 32px;
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: 20px;
	font-weight: 600;
	color: white;
	cursor: pointer;
}

@media (max-width: 1024px) {
	.joinus-container {
		justify-items: center;
	}
}

@media (max-width: 768px) {
	.joinus-section {
		padding: clamp(96px, 22vw, 140px) 24px 56px;
	}

	.joinus-container {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.joinus-media {
		width: 100%;
		order: -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.media-wrapper {
		border-radius: 40px;
		height: clamp(360px, 70vw, 520px);
		width: min(420px, 100%);
	}

	.joinus-form-card {
		padding: 28px;
		width: 420px;
		border-radius: 40px 40px 0 0;
		margin-bottom: -70px;
		z-index: 0;
	}
}
</style>
