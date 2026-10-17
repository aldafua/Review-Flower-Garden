import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("gardenContainer");
const statusText = document.getElementById("statusText");
const loadingMessage = document.getElementById("loadingMessage");

let scene, camera, renderer, controls;
let flowerObjects = [];
let animationRunning = true;
let animationFrame;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const lowColor = new THREE.Color("#ff5477");
const midColor = new THREE.Color("#ffbd70");
const highColor = new THREE.Color("#6af0b9");

function getRatingColor(rating) {
    if (rating <= 2) return lowColor.clone();
    if (rating <= 3) return midColor.clone();
    return highColor.clone();
}

function makeMaterial(color, emissiveIntensity = 0.25) {
    return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        roughness: 0.35,
        metalness: 0.05
    });
}

function addLights() {
    scene.add(new THREE.AmbientLight(0xc4caff, 1.8));

    const mainLight = new THREE.PointLight(0xffb7e7, 180);
    mainLight.position.set(0, 25, 25);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x766dff, 130);
    blueLight.position.set(-25, 0, -25);
    scene.add(blueLight);
}

function createGround() {
    const grid = new THREE.GridHelper(100, 50, 0x574a91, 0x292b50);
    grid.position.y = -20;
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    scene.add(grid);

    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x10152b,
        roughness: 1,
        metalness: 0
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -20.2;
    scene.add(ground);
}

function createFlower(review, index) {
    const group = new THREE.Group();

    const x = Number(review.x) || 0;
    const y = Number(review.y) || 0;
    const z = Number(review.z) || 0;

    group.position.set(x, y, z);

    const rating = Number(review.rating) || 3;
    const color = getRatingColor(rating);

    const flowerSize = THREE.MathUtils.clamp(
        Number(review.flower_size) || 0.8,
        0.4,
        1.8
    );

    const petalLength = THREE.MathUtils.clamp(
        Number(review.petal_length) || 1,
        0.5,
        2
    );

    const layers = THREE.MathUtils.clamp(
        Math.round(Number(review.petal_layers) || 1),
        1,
        5
    );

    // Batang bunga
    const stemHeight = 1.5 + flowerSize * 1.4;
    const stemGeometry = new THREE.CylinderGeometry(
        0.035 * flowerSize,
        0.065 * flowerSize,
        stemHeight,
        5
    );

    const stemMaterial = makeMaterial(new THREE.Color("#43c99a"), 0.12);
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -stemHeight / 2;
    group.add(stem);

    // Daun kecil pada batang
    const leafGeometry = new THREE.SphereGeometry(0.28 * flowerSize, 7, 5);
    const leafMaterial = makeMaterial(new THREE.Color("#36b984"), 0.1);

    for (let side = 0; side < 2; side++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.scale.set(1.5, 0.35, 0.65);
        leaf.position.set(
            side === 0 ? 0.22 * flowerSize : -0.22 * flowerSize,
            -stemHeight * (side === 0 ? 0.35 : 0.65),
            0
        );
        leaf.rotation.z = side === 0 ? -0.45 : 0.45;
        group.add(leaf);
    }

    // Lapisan kelopak: helpfulness lebih tinggi menghasilkan lebih banyak lapisan.
    const petalGeometry = new THREE.SphereGeometry(1, 9, 7);
    const petalMaterial = makeMaterial(color, 0.5);

    const petalCount = 8;
    const flowerCenterY = 0.15 * flowerSize;

    for (let layer = 0; layer < layers; layer++) {
        const petalsThisLayer = petalCount + layer * 2;
        const layerScale = 1 - layer * 0.12;
        const angleOffset = layer % 2 === 0 ? 0 : Math.PI / petalsThisLayer;

        for (let p = 0; p < petalsThisLayer; p++) {
            const angle =
                (p / petalsThisLayer) * Math.PI * 2 + angleOffset;

            const petal = new THREE.Mesh(
                petalGeometry,
                petalMaterial
            );

            const radius = flowerSize * 0.42 * layerScale;

            petal.position.set(
                Math.cos(angle) * radius,
                flowerCenterY + layer * 0.055 * flowerSize,
                Math.sin(angle) * radius
            );

            petal.scale.set(
                0.22 * flowerSize * petalLength * layerScale,
                0.11 * flowerSize * layerScale,
                0.48 * flowerSize * petalLength * layerScale
            );

            // Arahkan kelopak menjauhi pusat bunga.
            petal.rotation.y = -angle;
            petal.rotation.z = Math.cos(angle) * 0.22;

            petal.userData.review = review;
            petal.userData.flowerIndex = index;

            group.add(petal);
            flowerObjects.push(petal);
        }
    }

    // Pusat bunga
    const centerGeometry = new THREE.SphereGeometry(
        0.18 * flowerSize,
        10,
        8
    );

    const centerMaterial = makeMaterial(
        new THREE.Color("#ffe39b"),
        0.8
    );

    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = flowerCenterY + layers * 0.055 * flowerSize;
    center.userData.review = review;
    center.userData.flowerIndex = index;
    group.add(center);
    flowerObjects.push(center);

    // Sedikit variasi arah agar taman terlihat alami.
    group.rotation.y = (index % 20) * 0.17;

    scene.add(group);
}

function updateStatistics(data) {
    document.getElementById("totalReviews").textContent =
        data.length.toLocaleString("id-ID");

    const ratings = data
        .map(item => Number(item.rating))
        .filter(value => Number.isFinite(value));

    const average = ratings.length
        ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
        : 0;

    document.getElementById("averageRating").textContent =
        average.toFixed(2) + " ★";

    const years = data
        .map(item => Number(item.year))
        .filter(value => Number.isFinite(value) && value > 0);

    document.getElementById("yearRange").textContent = years.length
        ? `${Math.min(...years)}–${Math.max(...years)}`
        : "—";

    const words = data
        .map(item => Number(item.word_count))
        .filter(value => Number.isFinite(value));

    const averageWords = words.length
        ? words.reduce((sum, value) => sum + value, 0) / words.length
        : 0;

    document.getElementById("averageWords").textContent =
        Math.round(averageWords).toLocaleString("id-ID");
}

function showReview(review) {
    document.getElementById("emptySelection").hidden = true;
    document.getElementById("reviewDetails").hidden = false;

    document.getElementById("detailRating").textContent =
        `★ ${Number(review.rating || 0).toFixed(1)} / 5`;

    document.getElementById("detailTitle").textContent =
        review.title || "Judul tidak diketahui";

    document.getElementById("detailYear").textContent =
        review.year || "—";

    document.getElementById("detailWords").textContent =
        Number(review.word_count || 0).toLocaleString("id-ID");

    document.getElementById("detailCharacters").textContent =
        Number(review.character_count || 0).toLocaleString("id-ID");

    document.getElementById("detailHelpfulness").textContent =
        `${(Number(review.helpfulness || 0) * 100).toFixed(1)}%`;

    document.getElementById("detailSummary").textContent =
        review.summary || "Tidak ada ringkasan ulasan.";
}

function onPointerClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(flowerObjects, false);

    if (hits.length > 0) {
        const review = hits[0].object.userData.review;
        if (review) showReview(review);
    }
}

function initScene(data) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#090d1d");
    scene.fog = new THREE.FogExp2("#090d1d", 0.006);

    camera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    camera.position.set(0, 5, 58);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 12;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);

    addLights();
    createGround();

    // Bintang latar
    const starCount = 700;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 130;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xd7d9ff,
        size: 0.12,
        transparent: true,
        opacity: 0.75
    });

    scene.add(new THREE.Points(starGeometry, starMaterial));

    data.forEach((review, index) => createFlower(review, index));

    renderer.domElement.addEventListener("click", onPointerClick);

    document.getElementById("resetView").addEventListener("click", () => {
        camera.position.set(0, 5, 58);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    document.getElementById("toggleRotation").addEventListener("click", event => {
        animationRunning = !animationRunning;
        event.currentTarget.textContent = animationRunning
            ? "Jeda Rotasi"
            : "Lanjut Rotasi";
    });

    window.addEventListener("resize", onResize);

    statusText.textContent = "Taman berhasil dimuat";
    loadingMessage.style.display = "none";

    animate();
}

function onResize() {
    if (!camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationFrame = requestAnimationFrame(animate);

    if (animationRunning && scene) {
        scene.rotation.y += 0.00035;
    }

    controls?.update();
    renderer?.render(scene, camera);
}

async function start() {
    try {
        statusText.textContent = "Membaca data ulasan...";

        const response = await fetch("./review_flower_garden_data.json");

        if (!response.ok) {
            throw new Error(
                `File JSON tidak ditemukan (HTTP ${response.status}).`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("File JSON kosong atau formatnya tidak sesuai.");
        }

        updateStatistics(data);
        initScene(data);
    } catch (error) {
        console.error("Gagal memuat Review Flower Garden:", error);

        statusText.textContent = "Gagal memuat data";
        loadingMessage.innerHTML = `
            <h3>Belum bisa menumbuhkan taman 🌱</h3>
            <p>${error.message}</p>
            <p>Pastikan file JSON ada di folder yang sama dan buka lewat Live Server.</p>
        `;
    }
}

start();
