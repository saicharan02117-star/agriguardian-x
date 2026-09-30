import sys, tempfile, unittest
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).parents[1];sys.path.insert(0,str(ROOT/'ml'))
from features import image_features
from train import load,CLASSES
class MLTests(unittest.TestCase):
 def test_feature_vector_is_finite(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'leaf.png';Image.fromarray(np.full((32,32,3),[30,150,50],dtype=np.uint8)).save(p);x=image_features(p);self.assertEqual(x.shape,(57,));self.assertTrue(np.isfinite(x).all())
 def test_duplicate_removal(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)
   for folder in CLASSES:(root/folder).mkdir()
   im=Image.fromarray(np.full((8,8,3),80,dtype=np.uint8));im.save(root/next(iter(CLASSES))/'a.png');im.save(root/list(CLASSES)[1]/'b.png')
   rows,dupes=load(root);self.assertEqual(len(rows),1);self.assertEqual(dupes,1)
if __name__=='__main__':unittest.main()
