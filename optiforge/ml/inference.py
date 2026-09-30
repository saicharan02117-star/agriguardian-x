"""CLI inference for the trained evaluation artifact."""
import argparse, json
from pathlib import Path
import joblib
from features import image_features

def predict(model_path: Path,image_path: Path):
    model=joblib.load(model_path);probs=model.predict_proba([image_features(image_path)])[0];ranking=sorted(zip(model.classes_,probs),key=lambda x:x[1],reverse=True)
    return {"prediction":ranking[0][0],"confidence":round(float(ranking[0][1]),4),"probabilities":{k:round(float(v),4) for k,v in ranking}}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("model",type=Path);p.add_argument("image",type=Path);a=p.parse_args();print(json.dumps(predict(a.model,a.image),indent=2))
