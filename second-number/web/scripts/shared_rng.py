"""
A tiny deterministic RNG (mulberry32) shared by the Python and TypeScript engines
for parity tests. It stands in for Python's `random` module: seed, random, choice
and sample are the only calls the engine makes. web/src/engine/rng.ts must match.
"""
M=0xFFFFFFFF

class SharedRng:
    def __init__(self, seed=1): self.seed(seed)
    def seed(self, s): self.a=int(s)&M
    def random(self):
        self.a=(self.a+0x6D2B79F5)&M
        t=self.a
        t=((t^(t>>15))*(t|1))&M
        t=((t+(((t^(t>>7))*(t|61))&M))&M)^t
        return ((t^(t>>14))&M)/4294967296
    def choice(self, seq):
        seq=list(seq); return seq[int(self.random()*len(seq))]
    def sample(self, seq, k):
        pool=list(seq); out=[]
        for _ in range(k): out.append(pool.pop(int(self.random()*len(pool))))
        return out
