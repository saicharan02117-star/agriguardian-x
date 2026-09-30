# Dataset card

## Training source
- PlantVillage Dataset: https://github.com/spMohanty/PlantVillage-Dataset
- Paper: Mohanty, Hughes & Salathé (2016), *Using Deep Learning for Image-Based Plant Disease Detection*, DOI 10.3389/fpls.2016.01419.
- Selected folders: `Tomato___healthy`, `Tomato___Early_blight`, `Tomato___Late_blight`.

The upstream repository describes 54,306 images covering 14 crops and 26 diseases. This project deliberately trains only the three declared classes. It does not relabel uncontrolled farmer images as training data.

## Knowledge sources
- Tamil Nadu Agricultural University, Tomato Early Blight: https://agritech.tnau.ac.in/crop_protection/tomato_diseases_2.html
- Tamil Nadu Agricultural University, Tomato Late Blight: https://agritech.tnau.ac.in/crop_protection/tomato_diseases_8.html

Treatment text is conservative because exact recommendations depend on crop stage, local registration, field conditions and expert guidance.

## Governance
New field images enter an inspection record. They may enter a future training set only after consent, expert label review, duplicate checks and a new held-out evaluation.
