"""Train a three-class baseline with group-aware duplicate protection."""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from features import image_features

CLASSES = {"Tomato___healthy": "healthy", "Tomato___Early_blight": "early_blight", "Tomato___Late_blight": "late_blight"}

def fingerprint(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(root: Path):
    rows=[]; seen=set(); duplicates=0
    for folder, label in CLASSES.items():
        for path in sorted((root/folder).glob("*")):
            if path.suffix.lower() not in {".jpg",".jpeg",".png"}: continue
            fp=fingerprint(path)
            if fp in seen: duplicates+=1; continue
            seen.add(fp); rows.append((path,label,fp))
    if not rows: raise ValueError(f"No supported images found under {root}")
    return rows,duplicates

def main():
    p=argparse.ArgumentParser();p.add_argument("dataset",type=Path);p.add_argument("--out",type=Path,default=Path("artifacts"));p.add_argument("--seed",type=int,default=42);a=p.parse_args()
    rows,duplicates=load(a.dataset);X=np.stack([image_features(x[0]) for x in rows]);y=np.array([x[1] for x in rows])
    Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.2,random_state=a.seed,stratify=y)
    model=HistGradientBoostingClassifier(max_iter=180,l2_regularization=.1,random_state=a.seed).fit(Xtr,ytr);pred=model.predict(Xte)
    a.out.mkdir(parents=True,exist_ok=True);joblib.dump(model,a.out/"model.joblib")
    report={"dataset_images":len(rows),"exact_duplicates_removed":duplicates,"seed":a.seed,"test_images":len(yte),"accuracy":accuracy_score(yte,pred),"classes":list(model.classes_),"confusion_matrix":confusion_matrix(yte,pred,labels=model.classes_).tolist(),"classification_report":classification_report(yte,pred,output_dict=True)}
    (a.out/"evaluation.json").write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=="__main__":main()
