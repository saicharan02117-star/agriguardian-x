# Model card — tomato condition prototype

## Scope
The reproducible baseline distinguishes three controlled-image classes: tomato healthy, tomato early blight, and tomato late blight. It is a screening aid. It does not establish a laboratory diagnosis or universal field accuracy.

## Pipeline
Images are resized to 96×96 RGB. The baseline extracts color histograms, channel statistics and edge/texture statistics, then trains a regularized histogram gradient-boosting classifier. Exact byte duplicates are removed before the stratified 80/20 split. The random seed is fixed at 42.

Run `python ml/train.py DATASET_ROOT --out artifacts` and inspect `artifacts/evaluation.json`. The repository does not claim a score until that generated evidence is committed.

## Safety behavior
The web prototype validates type and size, scores image quality, exposes visual evidence, and returns an uncertain result when its quality/confidence threshold is not met. Users are told to seek confirmation before treatment.

## Limits
PlantVillage largely contains centered leaves under controlled conditions. Background, illumination, cultivar, growth stage, mixed disease, pest damage and nutrient stress can cause distribution shift. Confidence is not disease probability in the field.
